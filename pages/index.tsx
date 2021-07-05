import useForm from "../hooks/useForm";
import { useState } from "react";
import { inspect } from "@xstate/inspect";

if (typeof window !== "undefined") {
  inspect({ iframe: false });
}

interface LoginForm {
  email: string;
  password: string;
}

const IndexPage = () => {
  const [options, setOptions] = useState<{
    validateOnChange: boolean;
    validateOnBlur: boolean;
    disableSubmitWhileSubmitting: boolean;
    disableIfIsInvalid: boolean;
  }>({
    validateOnChange: false,
    validateOnBlur: false,
    disableSubmitWhileSubmitting: false,
    disableIfIsInvalid: false,
  });

  const [state, { handleOnChange, handleOnBlur, isValid, handleOnSubmit }] =
    useForm<LoginForm>({
      initialValues: {
        password: "",
        email: "",
      },
      validateOnChange: options.validateOnChange,
      validateOnBlur: options.validateOnBlur,
      onValidate: (values) => {
        let errors = {};

        if (!values.password) {
          errors["password"] = "This field is required";
        }

        if (
          !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
            values.email
          )
        ) {
          errors["email"] = "You have entered an invalid email address!";
        }

        if (Boolean(Object.keys(errors).length)) {
          return new Promise((resolve, reject) => {
            setTimeout(() => reject(errors), 1500);
          });
        } else {
          return new Promise((resolve) => {
            setTimeout(() => resolve(), 1500);
          });
        }
      },
      onSubmit: (values) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1500);
        });
        // return Promise.reject({ error: "Submit error 5054xxx3" });
      },
    });

  return (
    <div className="container mx-auto">
      <div className="flex justify-center px-6 my-12">
        <div className="w-full xl:w-3/4 lg:w-11/12 flex">
          <div className="w-full h-auto">
            <div className="p-8 bg-gray-900 text-center rounded-3xl text-white border-4 shadow-xl border-white">
              <h1 className="text-white font-semibold text-2xl">
                Form Machine State
              </h1>
              <div className="pt-2 tracking-wide border-dashed border-2 mt-2 p-2">
                <span className="text-white">
                  {JSON.stringify(state.value, null, 4)}
                </span>
              </div>
              <hr className="mt-4 border-1 border-gray-600" />
              <div
                className="pt-8"
                style={{
                  filter: `${
                    state.matches("validating") ||
                    state.matches({ submitting: "validatingBeforeSubmit" })
                      ? "blur(8px)"
                      : ""
                  } `,
                }}
              >
                <p className="font-semibold text-gray-400 text-left mb-4">
                  <span className="material-icons align-middle">value:</span>
                  <span className="pl-2">
                    <span className="text-white">
                      {JSON.stringify(state.context.values, null, 4)}
                    </span>
                  </span>
                </p>
                <p className="font-semibold text-gray-400 text-left mb-4">
                  <span className="material-icons align-middle">touched:</span>
                  <span className="pl-2">
                    <span className="text-white">
                      {JSON.stringify(state.context.touched)}
                    </span>
                  </span>
                </p>
                <p className="font-semibold text-gray-400 text-left mb-4">
                  <span className="material-icons align-middle">errors:</span>
                  <span className="pl-2">
                    <span className="text-white">
                      {JSON.stringify(state.context.errors)}
                    </span>
                  </span>
                </p>
                <p className="font-semibold text-gray-400 text-left mb-4">
                  <span className="material-icons align-middle">
                    submitError:
                  </span>
                  <span className="pl-2">
                    <span className="text-white">
                      {JSON.stringify(state.context.submitError)}
                    </span>
                  </span>
                </p>
                <p className="font-semibold text-gray-400 text-left mb-4">
                  <span className="material-icons align-middle">
                    validateOnChange (300ms):
                  </span>
                  <span className="pl-2">
                    <span className="text-white">
                      <button
                        type="button"
                        className={`${
                          options.validateOnChange
                            ? "bg-green-500"
                            : "bg-red-500"
                        }   text-white px-6 py-2 rounded font-medium mx-3 hover:bg-red-600 transition duration-200 each-in-out`}
                        onClick={() => {
                          setOptions((prevState) => ({
                            ...prevState,
                            validateOnChange: !prevState.validateOnChange,
                          }));
                        }}
                      >
                        {options.validateOnChange ? "ON" : "OFF"}
                      </button>
                    </span>
                  </span>
                </p>
                <p className="font-semibold text-gray-400 text-left mb-4">
                  <span className="material-icons align-middle">
                    validateOnBlur:
                  </span>
                  <span className="pl-2">
                    <span className="text-white">
                      <button
                        type="button"
                        className={`${
                          options.validateOnBlur ? "bg-green-500" : "bg-red-500"
                        }   text-white px-6 py-2 rounded font-medium mx-3 hover:bg-red-600 transition duration-200 each-in-out`}
                        onClick={() => {
                          setOptions((prevState) => ({
                            ...prevState,
                            validateOnBlur: !prevState.validateOnBlur,
                          }));
                        }}
                      >
                        {options.validateOnBlur ? "ON" : "OFF"}
                      </button>
                    </span>
                  </span>
                </p>
                <p className="font-semibold text-gray-400 text-left mb-4">
                  <span className="material-icons align-middle">
                    disableSubmitWhileSubmitting:
                  </span>
                  <span className="pl-2">
                    <span className="text-white">
                      <button
                        type="button"
                        className={`${
                          options.disableSubmitWhileSubmitting
                            ? "bg-green-500"
                            : "bg-red-500"
                        }   text-white px-6 py-2 rounded font-medium mx-3 hover:bg-red-600 transition duration-200 each-in-out`}
                        onClick={() => {
                          setOptions((prevState) => ({
                            ...prevState,
                            disableSubmitWhileSubmitting:
                              !prevState.disableSubmitWhileSubmitting,
                          }));
                        }}
                      >
                        {options.disableSubmitWhileSubmitting ? "ON" : "OFF"}
                      </button>
                    </span>
                  </span>
                </p>
                <p className="font-semibold text-gray-400 text-left mb-4">
                  <span className="material-icons align-middle">
                    disableButtonIfIsInvalid:
                  </span>
                  <span className="pl-2">
                    <span className="text-white">
                      <button
                        type="button"
                        className={`${
                          options.disableIfIsInvalid
                            ? "bg-green-500"
                            : "bg-red-500"
                        }   text-white px-6 py-2 rounded font-medium mx-3 hover:bg-red-600 transition duration-200 each-in-out`}
                        onClick={() => {
                          setOptions((prevState) => ({
                            ...prevState,
                            disableIfIsInvalid: !prevState.disableIfIsInvalid,
                          }));
                        }}
                      >
                        {options.disableIfIsInvalid ? "ON" : "OFF"}
                      </button>
                    </span>
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 bg-white p-5 rounded-lg lg:rounded-l-none">
            <h3 className="pt-4 text-2xl text-center">Welcome Back!</h3>
            <form
              className="px-8 pt-6 pb-8 mb-4 bg-white rounded"
              onSubmit={handleOnSubmit}
            >
              <div className="mb-4">
                <label
                  className="block mb-2 text-sm font-bold text-gray-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className={`w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline
                  ${state.context.errors.email ? "border-red-500" : ""}
                  `}
                  id="email"
                  name="email"
                  type="text"
                  placeholder="Email"
                  onChange={handleOnChange}
                  onBlur={handleOnBlur}
                  value={state.context.values.email}
                />
                {state.context.errors.email && (
                  <p className="text-xs italic text-red-500">
                    {state.context.errors.email}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  className="block mb-2 text-sm font-bold text-gray-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className={`w-full px-3 py-2 mb-3 text-sm leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline
                  ${state.context.errors.password ? "border-red-500" : ""}
                  `}
                  id="password"
                  type="password"
                  name="password"
                  placeholder="******************"
                  onChange={handleOnChange}
                  onBlur={handleOnBlur}
                  value={state.context.values.password}
                />
                {state.context.errors.password && (
                  <p className="text-xs italic text-red-500">
                    {state.context.errors.password}
                  </p>
                )}
              </div>
              {/*<div className="mb-4">
                <input
                  className="mr-2 leading-tight"
                  type="checkbox"
                  id="checkbox_id"
                />
                <label className="text-sm" htmlFor="checkbox_id">
                  Remember Me
                </label>
              </div>*/}
              <div className="mb-6 text-center">
                <button
                  className={`w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none focus:shadow-outline disabled:opacity-30 ${
                    options.disableSubmitWhileSubmitting &&
                    state.matches({ submitting: "validatingBeforeSubmit" })
                      ? "pointer-events-none"
                      : ""
                  } `}
                  type="submit"
                  disabled={
                    options.disableSubmitWhileSubmitting
                      ? state.matches({ submitting: "validatingBeforeSubmit" })
                      : options.disableIfIsInvalid
                      ? !isValid
                      : false
                  }
                >
                  Sign In
                </button>
              </div>
              <hr className="mb-6 border-t" />
              <div className="text-center">
                <a
                  className="inline-block text-sm text-blue-500 align-baseline hover:text-blue-800"
                  href="./register.html"
                >
                  Create an Account!
                </a>
              </div>
              <div className="text-center">
                <a
                  className="inline-block text-sm text-blue-500 align-baseline hover:text-blue-800"
                  href="./forgot-password.html"
                >
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
