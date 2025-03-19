import React from 'react'

 
const contact = () => {
  return (
    <div className='bg-blue-400 h-full p-1' >
      

      <section className='' >
      
        <div className='grid grid-cols-12 px-15 mt-20 mx-20 mb-2 bg-gray-100  rounded-lg'>

          <div className='col-span-5'  >
          <div className="   lg:p-8 lg:rounded-r-2xl rounded-2xl ">
      
        <input
          type="text"
          className="w-full h-8 text-gray-600 placeholder-gray-400 rounded-md  shadow-sm bg-transparent text-lg font-normal leading-7  border border-gray-200 focus:outline-none pl-4 mb-5"
          placeholder="Name"
        />
        <input
          type="text"
          className="w-full h-8 text-gray-600 placeholder-gray-400 rounded-md shadow-sm bg-transparent text-lg font-normal leading-7  border border-gray-200 focus:outline-none pl-4 mb-5"
          placeholder="Email"
        />
        <input
          type="text"
          className="w-full pb-15 text-gray-600 placeholder-gray-400 rounded-md shadow-sm bg-transparent text-lg font-normal leading-7 border border-gray-200 focus:outline-none pl-4 mb-7"
          placeholder="Message..."
        />
        <div className="mb-7">
          
          <div className="flex">
            
            <div className="flex gap-10">
  <div className="inline-flex items-center">
    <label className="relative flex items-center cursor-pointer" htmlFor="html">
      <input
        name="framework"
        type="radio"
        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
        id="html"
      />
      <span className="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
    </label>
    <label
      className="ml-2 text-slate-600 cursor-pointer text-sm"
      htmlFor="html"
    >
      Email
    </label>
  </div>
  <div className="inline-flex items-center">
    <label
      className="relative flex items-center cursor-pointer"
      htmlFor="react"
    >
      <input
        name="framework"
        type="radio"
        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-slate-300 checked:border-slate-400 transition-all"
        id="react"
        defaultChecked=""
      />
      <span className="absolute bg-slate-800 w-3 h-3 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></span>
    </label>
    <label
      className="ml-2 text-slate-600 cursor-pointer text-sm"
      htmlFor="react"
    >
      Phone
    </label>
  </div>
</div>

          </div>
        </div>
       
        <button className="w-full h-8 text-white text-base font-semibold leading-6 rounded-md transition-all duration-700 hover:bg-blue-800 bg-blue-600 shadow-sm">
          Send
        </button>
      </div>
          </div>


         <div className='col-span-7'>
          
          <div className='grid grid-cols-2 mt-15'>
            <div className='flex p-3 col-span-1'>
              <div className='p-2'>
              <img src="https://cdn-icons-png.freepik.com/256/2951/2951105.png?ga=GA1.1.1789686664.1720941409&semt=ais_hybrid" alt="" className='h-15 w-15 p-3 text-blue-500 bg-blue-300 rounded-md  ' />
              </div>
              <div className='p-2'>
              <h2 className='font-bold text-lg '>Technical Support</h2>
             
              <h3>support@example.com</h3>
              <h3>+91 7460029871</h3>


              </div>
             
            </div>
            <div className='flex p-3 col-span-1'>
              <div className='p-2'>
              <img src="https://cdn-icons-png.freepik.com/256/5567/5567326.png?ga=GA1.1.1789686664.1720941409&semt=ais_hybrid" alt="" className='h-15 w-15 p-3 bg-blue-300 rounded-md  ' />
              </div>
              <div className='p-2'>
              <h2 className='font-bold text-lg '>Sales Questions</h2>
             
              <h3>support@example.com</h3>
              <h3>+91 7460029871</h3>


              </div>
             
            </div>
            <div className='flex p-3 col-span-1'>
              <div className='p-2'>
              <img src="https://cdn-icons-png.freepik.com/256/3166/3166234.png?ga=GA1.1.1789686664.1720941409&semt=ais_hybrid" alt="" className='h-15 w-15 p-3 bg-blue-300 rounded-md  ' />
              </div>
              <div className='p-2'>
              <h2 className='font-bold text-lg '>Privacy</h2>
             
              <h3>support@example.com</h3>
              <h3>+91 7460029871</h3>


              </div>
             
            </div>
            <div className='flex p-3 col-span-1'>
              <div className='p-2'>
              <img src="https://cdn-icons-png.freepik.com/256/9749/9749273.png?ga=GA1.1.1789686664.1720941409&semt=ais_hybrid" alt="" className='h-15 w-15 p-3 bg-blue-300 rounded-md  ' />
              </div>
              <div className='p-2'>
              <h2 className='font-bold text-lg '>Bug Report</h2>
             
              <h3>support@example.com</h3>
              <h3>+91 7460029871</h3>


              </div>
             
            </div>

          </div>

         </div>



        </div>
      </section>

    </div>
  )
}

export default contact;
