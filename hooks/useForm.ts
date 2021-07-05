import { useMachine } from "@xstate/react";
import createFormMachine, { FormTouched, FormValues } from "../machines/form";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo } from "react";

interface UseFormInput<T> {
  initialValues: FormValues<T>;
  onSubmit?: (
    values: FormValues<T>,
    resetValuesOnDone?: boolean
  ) => Promise<void>;
  onValidate?: (values: FormValues<T>) => Promise<void>;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  onChangeValidatorDebounce?: number;
}

const useForm = <T>(props: UseFormInput<T>) => {
  const {
    initialValues,
    validateOnBlur = false,
    validateOnChange = false,
    onChangeValidatorDebounce = 500,
  } = props;

  const [formModel, formMachine] = useMemo(() => createFormMachine<T>(), []);

  const [state, send] = useMachine(formMachine, {
    context: {
      values: initialValues,
      validateOnBlur,
      validateOnChange,
      onChangeValidatorDebounce,
    },
    services: {
      onValidate: (context) => {
        return Boolean(props.onValidate)
          ? props.onValidate(context.values)
          : Promise.resolve();
      },
      onSubmit: (context) => {
        return Boolean(props.onSubmit)
          ? props.onSubmit(context.values)
          : Promise.resolve();
      },
    },
    devTools: true,
  });

  const handleOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      send(formModel.events.CHANGE(event.target.name, event.target.value));
    },
    [send]
  );

  const handleOnBlur = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      send(formModel.events.BLUR(event.target.name));
    },
    [send]
  );

  const handleOnSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      send(formModel.events.SUBMIT());
    },
    [send]
  );

  const resetForm = useCallback(() => {
    send(formModel.events.RESET());
  }, [send]);

  const setValues = useCallback(
    (values: FormValues<T>, shouldValidate?: boolean) => {
      send(formModel.events.SET_VALUES(values, shouldValidate));
    },
    [send]
  );
  const setFieldTouched = useCallback(
    (touched: FormTouched<T>, shouldValidate?: boolean) => {
      send(formModel.events.SET_FIELD_TOUCHED(touched, shouldValidate));
    },
    [send]
  );

  useEffect(() => {
    send(formModel.events.SET_VALIDATE_ON_BLUR(props.validateOnBlur));
  }, [props.validateOnBlur]);

  useEffect(() => {
    send(formModel.events.SET_VALIDATE_ON_CHANGE(props.validateOnChange));
  }, [props.validateOnChange]);

  // It is valid when there are no errors
  const isValid = !Boolean(Object.keys(state.context.errors).length);

  return [
    state,
    {
      handleOnChange,
      handleOnBlur,
      handleOnSubmit,
      resetForm,
      setValues,
      setFieldTouched,
      isValid,
    },
  ] as const;
};

export default useForm;
