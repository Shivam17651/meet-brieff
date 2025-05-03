'use client'
import React, { useEffect } from 'react'
import AOS from "aos";
import "aos/dist/aos.css";
import AutoSlideshow from '@/app/slider/page';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const gradientStyle = {
  
  background: 'linear-gradient(to right, blue, green)',
  display: 'flex',
  justifyContent: 'center',
  
  color: 'white',
  
}


const About = () => {

useEffect(() => {
  AOS.init({duration:1200})
})



  return (
    <div>
      <div
      className='min-h-70 fill bg-cover' style={{ 
      backgroundImage: `url("https://cdn.wallpapersafari.com/60/47/tKyaF2.png")` 
    }}>
        <h1 className='text-white font-bold text-7xl text-center pt-25 pb-5'>About Us</h1>
        
        <p className='text-white font-bold text-xl text-center'>"Enhance your meetings with our Google Meet Brief Extension — automatically capturing key points, action items, and discussions for easy reference and follow-up."</p>
      </div>


          <div className='mt-10 '><AutoSlideshow/></div>

       


       <div className='grid grid-cols-4 mt-120'>

        <div className='col-span-2 ml-20 '>
            <div className='col-span-1 '><img className='rounded-lg hover:shadow-2xl hover:border-2 hover:border-gray-200  h-full ' src="https://b2729162.smushcdn.com/2729162/wp-content/uploads/2024/04/meeting-notes-1024x684.jpg?lossy=1&strip=1&webp=1" alt="" />
            </div>
           
             <div className=''><img className=' rounded-lg shadow-lg mx-auto w-50 h-50  -translate-18' data-aos="fade-up" src="https://st1.techlusive.in/wp-content/uploads/2024/08/Goole-Meet.jpg" alt="" /></div>

        </div>

        <div className='col-span-2'>
           
           <div style={gradientStyle} className=' rounded-lg border-2 border-blue-300 h-33 mb-6 w-3/4 ml-5 text-4xl font-bold text-center pt-9 hover:border-5 hover:shadow-xl ' data-aos="fade-left">Attending Meeting</div>
           <div style={gradientStyle} className=' rounded-lg border-2 border-blue-300 h-33 mb-6 ml-20 w-3/4 text-4xl font-bold text-center pt-9 hover:border-5 hover:shadow-xl' data-aos="fade-right">Converting Speech-to-text</div>
           <div style={gradientStyle} className=' rounded-lg border-2 border-blue-300 h-33 mb- w-3/4 ml-5 text-4xl font-bold text-center pt-9 hover:border-5 hover:shadow-xl' data-aos="fade-left">Generating Helpful Notes</div>
        </div>
        
       </div>

       {/*analytics*/}

       <div className='grid grid-cols-4 gradient_background max-w-[90%]   rounded-lg mb-20  mx-20'>

        
       <div className=' pl-10 pt-20  col-span-2' data-aos="zoom-in" >
        
        
        <h1 className='text-xl  text-white font-bold'>« WHY CHOOSE US »</h1>
        
        
        <h1 className='text-3xl  text-gray-100 font-semibold pt-9'>☑ Automated Notes without any hustle</h1>
        
        <h1 className='text-3xl  text-gray-100 font-semibold pt-4'>☑ Use for emergency meetings </h1>
        <h1 className='text-3xl  text-gray-100 font-semibold pt-4'>☑ Enhanced Productivity  </h1>
        <h1 className='text-3xl  text-gray-100 font-semibold pt-4'>☑ Better Performance </h1>
        
        <h1 className='text-3xl  text-gray-100 font-semibold pt-4'>☑ Time Efficient </h1>

        
       
       
       </div>

       <div className='col-span-2 p-5'  data-aos="fade-left"  >
          <img  src="https://cdn.prod.website-files.com/61120cb2509e012d40f0b214/663ce72494ab08bcbcf721d6_create%20a%20meeting%20summary-p-800.png" alt="" />
          
        </div>
       </div>
       {/*PArtners */}
       <h1 className='text-4xl font-bold underline px-30'>« TEAM MEMBERS » </h1>
       <div className='mx-20 flex  gap-30   py-10 px-10'>
        

        <div className='rounded-lg    ' data-aos="zoom-in">
        <img className='h-120 rounded-lg shadow-lg ' src="/image/MyImg.jpg" alt="" />
        <div className='font-bold -translate-y-40 border  bg-white mx-3 rounded-lg shadow-lg px-4 w-60'>
          <h1 className='text-xl text-red-800 underline '>DEEPANSHU TIWARI</h1>
          <p className='text-lg text-red-500  '>Developer</p>
          <div className='flex py-2 gap-2'>
          <img className='h-8 w-8 bg-white rounded-full' src="/image/github-brands.svg" alt="" />
          <img className='h-8 w-8 bg-white rounded-full' src="/image/facebook-brands.svg" alt="" />
          <img className='h-8 w-8  rounded-xl' src="/image/linkedin-brands.svg" alt="" />
          </div>
          
          
        </div>
        </div>
        <div className='rounded-lg   ' data-aos="zoom-in">
        <img className='h-120 rounded-lg shadow-lg ' src="/image/Shivam.jpg" alt="" />
        <div className='font-bold -translate-y-40 border  bg-white mx-3 rounded-lg shadow-lg px-4 w-60'>
          <h1 className='text-xl text-red-800 underline '>SHIVAM SRIVASTAV</h1>
          <p className='text-lg text-red-500  '>Developer</p>
          <div className='flex py-2 gap-2'>
          <img className='h-8 w-8 bg-white rounded-full' src="/image/github-brands.svg" alt="" />
          <img className='h-8 w-8 bg-white rounded-full' src="/image/facebook-brands.svg" alt="" />
          <img className='h-8 w-8  rounded-xl' src="/image/linkedin-brands.svg" alt="" />
          </div>
          
          
        </div>
        </div>
        <div className='rounded-lg  ' data-aos="zoom-in">
        <img className='h-120 rounded-lg shadow-lg ' src="/image/Saurabh.jpg" alt="" />
        <div className='font-bold -translate-y-40 border  bg-white mx-3 rounded-lg shadow-lg px-4 w-50'>
          <h1 className='text-lg text-red-800 underline '>SAURABH TIWARI</h1>
          <p className='text-lg text-red-500  '>Developer</p>
          <div className='flex py-2 gap-2'>
          <img className='h-8 w-8 bg-white rounded-full' src="/image/github-brands.svg" alt="" />
          <img className='h-8 w-8 bg-white rounded-full' src="/image/facebook-brands.svg" alt="" />
          <img className='h-8 w-8  rounded-xl' src="/image/linkedin-brands.svg" alt="" />
          </div>
          
          
        </div>
        </div>
       </div>

    </div>
  )
}

export default About;
