import { assertEventType } from "../utils";
import { createMachine } from "xstate";
import { createModel } from "xstate/lib/model";

export type FormValues<T> = Partial<Record<keyof T, T[keyof T]>>;
export type FormErrors<T> = Partial<Partial<Record<keyof T, string>>>;
export type FormTouched<T> = Partial<Record<keyof T, boolean>>;

const createFormModel = <T>() => {
  return createModel(
    {
      values: {} as FormValues<T>,
      errors: {} as FormErrors<T>,
      touched: {} as FormTouched<T>,
      validateOnBlur: true,
      validateOnChange: true,
      onChangeValidatorDebounce: 300,
      submitError: null as any,
    },
    {
      events: {
        CHANGE: (fieldName: string, value: any) => ({
          fieldName,
          value,
        }),
        BLUR: (fieldName: string) => ({
          fieldName,
        }),
        SUBMIT: () => ({}),
        RESET: () => ({}),
        SET_VALUES: (
          values: Partial<Record<keyof T, T[keyof T]>>,
          shouldValidate?: boolean
        ) => ({
          values,
          shouldValidate,
        }),
        SET_FIELD_TOUCHED: (
          touched: Partial<Record<keyof T, boolean>>,
          shouldValidate?: boolean
        ) => ({
          touched,
          shouldValidate,
        }),
        SET_VALIDATE_ON_BLUR: (shouldValidate: boolean) => ({
          shouldValidate,
        }),
        SET_VALIDATE_ON_CHANGE: (shouldValidate: boolean) => ({
          shouldValidate,
        }),
      },
    }
  );
};

const createFormMachine = <T>() => {
  const model = createFormModel<T>();
  const machine = createMachine<typeof model>(
    {
      id: "form_machine",
      initial: "idle",
      context: model.initialContext,
      states: {
        idle: {
          on: {
            SUBMIT: { target: "submitting", actions: ["clearErrors"] },
          },
        },
        changing: {
          after: {
            validatorDebounce: [
              {
                target: "validating",
                cond: "shouldValidateOnChange",
              },
              { target: "idle" },
            ],
          },
        },
        validating: {
          invoke: {
            src: "onValidate",
            onDone: "idle",
            onError: {
              target: "idle",
              actions: ["reportErrors"],
            },
          },
          on: {
            SUBMIT: "submitting",
          },
        },
        submitting: {
          initial: "validatingBeforeSubmit",
          states: {
            validatingBeforeSubmit: {
              invoke: {
                src: "onValidate",
                onDone: {
                  target: "successfulValidation",
                  actions: ["clearErrors"],
                },
                onError: {
                  target: "#form_machine.idle",
                  actions: ["reportErrors"],
                },
              },
            },
            successfulValidation: {
              invoke: {
                src: "onSubmit",
                onDone: {
                  target: "#form_machine.idle",
                  actions: ["clearSubmitError"],
                },
                onError: {
                  target: "#form_machine.idle",
                  actions: ["reportSubmitError"],
                },
              },
            },
          },
        },
      },
      on: {
        CHANGE: {
          target: "changing",
          actions: ["reportChange", "clearErrors"],
        },
        BLUR: [
          {
            actions: ["reportFieldTouched", "clearErrors"],
            target: "validating",
            cond: "shouldValidateOnBlur",
          },
          {
            actions: ["reportFieldTouched", "clearErrors"],
          },
        ],
        RESET: {
          target: "idle",
          actions: ["resetForm"],
        },
        SET_VALUES: [
          {
            target: "validating",
            cond: "shouldValidateOnSetValues",
            actions: ["mergeValues"],
          },
          {
            target: "idle",
            actions: ["mergeValues"],
          },
        ],
        SET_FIELD_TOUCHED: [
          {
            target: "validating",
            cond: "shouldValidateOnSetFieldTouched",
            actions: ["mergeTouched"],
          },
          {
            target: "idle",
            actions: ["mergeTouched"],
          },
        ],
        SET_VALIDATE_ON_BLUR: [
          {
            actions: ["setValidateOnBlur"],
          },
        ],
        SET_VALIDATE_ON_CHANGE: [
          {
            actions: ["setValidateOnChange"],
          },
        ],
      },
    },
    {
      actions: {
        reportChange: model.assign(
          {
            values: (context, event) => ({
              ...context.values,
              [event.fieldName]: event.value,
            }),
          },
          "CHANGE"
        ),
        reportErrors: model.assign({
          // @ts-ignore
          errors: (context, event) => event.data,
        }),
        reportSubmitError: model.assign({
          // @ts-ignore
          submitError: (context, event) => event.data,
        }),
        clearErrors: model.assign({
          errors: () => ({}),
          submitError: () => null,
        }),
        clearSubmitError: model.assign({
          submitError: () => null,
        }),
        resetForm: model.assign({
          values: () => ({}),
          errors: () => ({}),
          touched: () => ({}),
          submitError: () => null,
        }),
        reportFieldTouched: model.assign(
          {
            touched: (context, event) => ({
              ...context.touched,
              [event.fieldName]: true,
            }),
          },
          "BLUR"
        ),
        mergeValues: model.assign(
          {
            values: (context, event) => ({
              ...context.values,
              ...event.values,
            }),
          },
          "SET_VALUES"
        ),
        mergeTouched: model.assign(
          {
            touched: (context, event) => ({
              ...context.touched,
              ...event.touched,
            }),
          },
          "SET_FIELD_TOUCHED"
        ),
        setValidateOnBlur: model.assign(
          {
            validateOnBlur: (context, event) => event.shouldValidate,
          },
          "SET_VALIDATE_ON_BLUR"
        ),
        setValidateOnChange: model.assign(
          {
            validateOnChange: (context, event) => event.shouldValidate,
          },
          "SET_VALIDATE_ON_CHANGE"
        ),
      },
      delays: {
        validatorDebounce: (context) =>
          context.validateOnChange && context.onChangeValidatorDebounce
            ? context.onChangeValidatorDebounce
            : 0,
      },
      guards: {
        shouldValidateOnChange: (context) => {
          return context.validateOnChange;
        },
        shouldValidateOnBlur: (context) => {
          return context.validateOnBlur;
        },
        shouldValidateOnSetValues: (context, event) => {
          assertEventType(event, "SET_VALUES");
          return event.shouldValidate;
        },
        shouldValidateOnSetFieldTouched: (context, event) => {
          assertEventType(event, "SET_FIELD_TOUCHED");
          return event.shouldValidate;
        },
      },
    }
  );

  return [model, machine] as const;
};

export default createFormMachine;
