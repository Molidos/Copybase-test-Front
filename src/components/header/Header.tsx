import React from 'react'
import Image from 'next/image'

export const Header = () => {
    return (
        <div className='bg-indigo-500 h-16 gap-2 flex items-center pl-1 sm:pl-20'>
          
            <img src="/imgs/logo.svg" alt="" />
            <h1 className='text-white font-extrabold text-xs md:text-xl'> - Teste - Jony Fernandes</h1>
        </div>
    )
}
