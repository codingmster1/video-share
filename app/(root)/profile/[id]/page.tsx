import Header from '@/components/Header';
import React from 'react'

const page = async({params}: ParamsWithSearch) => {
    const {id } = await params;
  return (
    <div className="text-2xl font-karla">
        <Header subHeader="doylejeff98@gmail.com" title="Jeff"
        userImg="/assets/images/dummy.jpg"/>
        USER ID: {id}</div>
  )
}

export default page