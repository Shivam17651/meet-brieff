'use client'
import React, { useState, useEffect } from 'react';

const AutoSlideshow = () => {
  const images = [
    'https://i.ytimg.com/vi/ndDSVakMOKw/maxresdefault.jpg',
    'https://www.01net.com/app/uploads/2024/10/google-meet.jpg',
    'https://blogimages.softwaresuggest.com/blog/wp-content/uploads/2023/10/16172046/10-Best-AI-Note-Taking-App-in-2023-1.jpg',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000); // Change image every 1 seconds

    return () => clearInterval(timer); // Cleanup the interval on unmount
  }, [images.length]);

  return (
    <div className="slideshow-container grid grid-cols-2">
      
      
      <div className='col-span-1 pr-9 '>
        <div className='text-4xl font-bold  pt-5 gap-2  flex px-40'>
        <h1 className=' text-blue-500  '>What</h1>
        <h1 > we Do?</h1>
        </div>
        
          <p className='text-xl font-semibold pt-5 '>Meet Brief Extension for summaries automatically transcribes meetings, highlights key points, and generates concise meeting summaries for easy access to automated notes.



</p>
          <br />
          <br />
          <div className='text-4xl font-bold  pt-5 gap-2  flex px-40'>
        <h1 className=' text-blue-500  '>Why</h1>
        <h1 > we Do?</h1>
        </div>
         
          <p className='text-xl font-semibold pt-5 '>We developed this extension for automated summaries during emergency meeting , to save time,  enhance productivity, capture key points, and improve meeting efficiency for full recap.</p>
      </div>
      <div className='col-span-1'><img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} /></div>
    </div>
  );
};

export default AutoSlideshow;
