'use client'
import React, { useEffect } from 'react'

import AOS from "aos";
import "aos/dist/aos.css";
import Marquee from 'react-fast-marquee';


const Home = () => {

  useEffect(() => {
    AOS.init({duration:1200})
  })

  return (
<div>
    <div className='bg-white grid grid-cols-2'>
    <div className='  mt-10'>
      <div className='mt-20 ml-20 col-span-1 ' data-aos = "fade-right">
        <h2 className='text-blue-500 text-5xl font-bold p-10'>Meet Brief</h2>
        <p className='font-bold text-2xl ml-10'>"Effortless meeting summaries with our Extension."</p>
        <button className='bg-yellow-500 rounded-md py-3 px-5 text-xl font-semibold text-white shadow-md ml-10 mt-10 hover:bg-yellow-600'>Download Now!</button>
        </div>
        
      </div>

      <div className='col-span-1 p-10 mt-10 ' data-aos = "flip-left">
        <img src="https://static.vecteezy.com/system/resources/thumbnails/018/742/939/small_2x/laptop-computer-with-blank-transparent-screen-and-background-format-png.png" alt="" />
      </div>

      </div>


      <div className='grid grid-cols-2 bg-blue-500 bg-linear-to-r from-cyan-500 to-blue-500 shadow-md'>
        <div className=' ml-20  mt-10 col-span-1  'data-aos = "fade-right">

        <img className='w-[60%] ml-20 mt-20 ' 
        src="https://i.pinimg.com/736x/61/82/ad/6182adc429754e6bdc95bd29795408dc.jpg " alt="" />

        </div>

        <div className='col-span-1 mr-20 mt-20 p-10 ' data-aos = "fade-left">
          <img className=''
           src="https://meetdigest.netlify.app/static/media/featureZoom.6c62f76d.png" alt="" />
        </div>

      </div>

      <div>
        <Marquee pauseOnHover autoFill >

          <div className='grid grid-cols-5  p-10 mt-10 w-1/2  gap-10' data-aos = "fade-up">
            <div className='col-span-1 p-20 border-2 mt-20 ml-20 shadow-2xl bg-linear-to-t from-sky-500 to-indigo-500 w-[85%]'>
              <h2 className='text-5xl font-bold text-white'> Easy To Use</h2>
              <p className='font-semibold text-white mt-5 '>Our product is user-friendly, intuitive, and designed for seamless navigation,</p>
              <p className='font-semibold text-white'>ensuring a smooth experience with minimal effort</p>
            </div>
            <div className='col-span-1 p-20 border-2 mt-20 ml-10 shadow-2xl bg-linear-to-t from-sky-500 to-indigo-500  w-[85%]'>
              <h2 className='text-5xl font-bold text-white'> Easy To Use</h2>
              <p className='font-semibold text-white mt-5 '>Our product is user-friendly, intuitive, and designed for seamless navigation,</p>
              <p className='font-semibold text-white'>ensuring a smooth experience with minimal effort</p>
            </div>
            <div className='col-span-1 p-20 border-2 mt-20 mr-20 shadow-2xl bg-linear-to-t from-sky-500 to-indigo-500  w-[85%]'>
              <h2 className='text-5xl font-bold text-white'> Easy To Use</h2>
              <p className='font-semibold text-white mt-5'>Our product is user-friendly, intuitive, and designed for seamless navigation,</p>
              <p className='font-semibold text-white'>ensuring a smooth experience with minimal effort</p>
            </div>
            <div className='col-span-1 p-20 border-2 mt-20 mr-20 shadow-2xl bg-linear-to-t from-sky-500 to-indigo-500  w-[85%]'>
              <h2 className='text-5xl font-bold text-white'> Easy To Use</h2>
              <p className='font-semibold text-white mt-5'>Our product is user-friendly, intuitive, and designed for seamless navigation,</p>
              <p className='font-semibold text-white'>ensuring a smooth experience with minimal effort</p>
            </div>
            <div className='col-span-1 p-20 border-2 mt-20 mr-20 shadow-2xl bg-linear-to-t from-sky-500 to-indigo-500  w-[85%]'>
              <h2 className='text-5xl font-bold text-white'> Easy To Use</h2>
              <p className='font-semibold text-white mt-5'>Our product is user-friendly, intuitive, and designed for seamless navigation,</p>
              <p className='font-semibold text-white'>ensuring a smooth experience with minimal effort</p>
            </div>
      
          </div>

          </Marquee>

       
      </div>

      <div className='grid grid-cols-2 ml-20'>
        <div className='mt-30 p-5 ml-25 col-span-1 ' data-aos = "fade-up">
        <h2 className='text-5xl font-bold '>Now Never Miss a </h2>
        <h2  className='text-5xl font-bold text-blue-500'>Point.</h2>
        <p className='text-xl font-semibold  mt-10 '>Our Extension Keeps Track of Your Meetings</p>
          <p className='text-xl font-semibold text-blue-500 mt-1'> And Notes All The Key Points So You Never Have To Worry.</p>
      </div>

      <div className='col-span-1 ml-20' data-aos = "fade-in">
        <img className='w-[80%] mt-20 mb-20' 
        src="https://thumbs.dreamstime.com/b/woman-failed-driver-license-test-cries-sitting-car-near-instructor-making-mark-clipboard-failure-to-pass-practical-exam-road-349110662.jpg" alt="" />
      </div>


      </div>

      <div className=''>
        <div className='bg-linear-to-r from-cyan-500 to-blue-500' data-aos = "fade-up">
          <h2 className='text-5xl font-bold text-center p-10'>How Meet Brief Works?</h2>
      
        </div>

        <div className='grid grid-cols-2'>

        <div className='p-20  col-span-1 ml-5' data-aos = "fade-up" >
          <h2 className='text-blue-500 text-4xl font-bold mt-25 ml-20 '>Download Our Product From </h2>
          <h2 className='text-blue-800 text-5xl font-bold  ml-20 '>Chrome </h2>
        </div>

        <div className='col-span-1' data-aos = "fade-up">
          <img className='w-1/2 ml-30 p-10 mt-20  '
           src="https://www.cryptus.in/hackingnews/wp-content/uploads/2023/09/Chrome_Browser_Extensions-1.png" alt="" />

        </div>

        </div>


      </div>
<div className='grid grid-cols-2 mr-30 mt-10'>
      <div className='col-span-1' data-aos = "fade-up">
        <img className='w-full mt-10 ml-30 px-30 ' 
        src="https://meetdigest.netlify.app/static/media/step2.6c70b916.svg" alt="" />

      </div>

      <div className='col-span-1  ' data-aos = "fade-up">
        <h2 className='text-blue-400 text-center mt-20 text-4xl font-bold '>Record Button</h2>
        <h2 className='text-blue-800 ml-57 text-5xl font-bold '> Push</h2>
        <p className='text-xl font-semibold text-red-500 mt-1 ml-40 mt-20'>Add Meet Digest as a meeting attendee and you are ready to go. Meet Digest will join your conversation as a smart ML-powered meeting assistant. Just push the record button on the app and it will start transcription</p>
      </div>

      </div>

    
    

    </div>
  )
}

export default Home