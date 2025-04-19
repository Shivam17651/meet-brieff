'use client'
import Link from 'next/link'
import { useFormik } from 'formik';
import React from 'react'
import * as Yup from 'yup';
import { Infinity } from 'ldrs/react'
import 'ldrs/react/Infinity.css'
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Name Not Written'),
  email: Yup.string().email('Invalid email').required('Required'),

  password: Yup.string()
  .required('Password is Required')
  .min(8, 'should be 8 characters' )
  .matches(/[a-z]/, 'Lowercase is required')
  .matches(/[A-Z]/, 'Uppercase is required')
  .matches(/[0-9]/, 'Number is required')
  .matches(/[\W]/, 'Specail character is required'),
  confirmPassword: Yup.string()
  .required('Password is required')
  .oneOf([Yup.ref('password'), null], 'Passwords must match')
});

const Signup = () => {

  const router = useRouter();

  const signupForm = useFormik({
   initialValues : {
     name : '',
     email : '',
     password : '',
     confirmPassword : '',
    },
    onSubmit : async (values, { resetForm, setSubmitting }) => {
       console.log(values);
 
      try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/add` ,values);
       console.log(res.status);
       console.log(res.statusText);
       toast.success('User Registered Successfully');
       resetForm();
       router.push('/login');
      } catch (error) {
        console.log(error);
        setSubmitting(false);
        toast.error('User regestration unsuccessful');
      }
      
      
       //send values to backend 
       
    },
    validationSchema: SignupSchema
  })
 

  return (
    <div className=" bg-linear-to-r from-blue-400 to-cyan-500 py-6 sm:py-8 lg:py-12 grid grid-cols-2 ">
  <div className=" mx-auto max-w-screen-2xl px-4 md:px-8">
    <h2 className="mb-4 text-center text-4xl font-bold text-blue-800 md:mb-8 lg:text-3xl">
      SignUp
    </h2>


    <form onSubmit={signupForm.handleSubmit}>
        <div className="grid gap-y-4">
          {/* Form Group */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm mb-2 dark:text-white"
            >
              Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                onChange={ signupForm.handleChange}
                value={signupForm.values.name}
                className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                required=""
                aria-describedby="email-error"
              />
              <div className="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                <svg
                  className="size-5 text-red-500"
                  width={16}
                  height={16}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
              </div>
            </div>
            {
            (signupForm.touched.name && signupForm.errors.name) && (
              <p className=" text-xs text-red-600 mt-2" id="email-error">
              {signupForm.errors.name}
            </p>
            )
            }
           
          </div>
          {/* End Form Group */}
          {/* Form Group */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm mb-2 dark:text-white"
            >
              Email address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                onChange={ signupForm.handleChange}
                value={signupForm.values.email}
                className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                required=""
                aria-describedby="email-error"
              />
              <div className="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                <svg
                  className="size-5 text-red-500"
                  width={16}
                  height={16}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
              </div>
            </div>
            {
            (signupForm.touched.email && signupForm.errors.email) && (
              <p className=" text-xs text-red-600 mt-2" id="email-error">
              {signupForm.errors.email}
            </p>
            )
            }
          </div>
          {/* End Form Group */}
          {/* Form Group */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm mb-2 dark:text-white"
            >
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                onChange={ signupForm.handleChange}
                value={signupForm.values.password}
                className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                required=""
                aria-describedby="password-error"
              />
              <div className="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                <svg
                  className="size-5 text-red-500"
                  width={16}
                  height={16}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
              </div>
            </div>
            <p className="hidden text-xs text-red-600 mt-2" id="password-error">
              8+ characters required
            </p>
          </div>
          {/* End Form Group */}
          {/* Form Group */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm mb-2 dark:text-white"
             >
              Confirm Password
              </label>
             <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                onChange={ signupForm.handleChange}
                value={signupForm.values.confirmPassword}
                className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                required=""
                aria-describedby="confirm-password-error"
              />
              <div className="hidden absolute inset-y-0 end-0 pointer-events-none pe-3">
                <svg
                  className="size-5 text-red-500"
                  width={16}
                  height={16}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
              </div>
            </div>
            <p
              className="hidden text-xs text-red-600 mt-2"
              id="confirm-password-error"
            >
              Password does not match the password
            </p>
          </div>
          {/* End Form Group */}
          {/* Checkbox */}
          <div className="flex items-center">
            <div className="flex">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="shrink-0 mt-0.5 border-gray-200 rounded-sm text-blue-600 focus:ring-blue-500 dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
              />
            </div>
            <div className="ms-3">
              <label htmlFor="remember-me" className="text-sm dark:text-white">
                I accept the{" "}
                <a
                  className="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500"
                  href="#"
                >
                  Terms and Conditions
                </a>
              </label>
            </div>
          </div>
          {/* End Checkbox */}
          <button
          disabled={signupForm.isSubmitting}
            type="submit"
            className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            {
              signupForm.isSubmitting ? (
               

// Default values shown
<Infinity
  size="55"
  stroke="4"
  strokeLength="0.15"
  bgOpacity="0.1"
  speed="1.3"
  color="black" 
/>
              ) : "Submit Form"
            }
          </button>
        </div>
      
        <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
        Already have an account?
        <Link
          className="text-blue-600 decoration-2 hover:underline focus:outline-hidden focus:underline font-medium dark:text-blue-500"
          href="/login"
        >
          Sign in here
        </Link>
      </p>

      </form>
      
  </div>
  
<div className='mr-25 '>

  <h2 className='text-5xl text-center font-bold text-blue-800 mt-50'>Meet Brief</h2>
  <p className='mt-20 text-center text-xl '>Welcome To Meet Brief Extension just login And Make Your Meetings Easier.</p>

  
</div>

<div>


  
</div>

</div>


  )

  
}





export default Signup