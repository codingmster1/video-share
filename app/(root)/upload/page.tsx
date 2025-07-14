"use client";
import FileInput from '@/components/FileInput'
import FormField from '@/components/FormField'
import React, { useState } from 'react'

const page = () => {
    const [error, setError] = useState(null)
  return (
    <div className="wrapper-md upload-page">
        <h1>Upload a Video</h1>
        {error && <div className="error-field">{error}</div>}

        <form className="rounded-20 shadow-10 gap-6 w-full flex
        flex-col px-5 py-7.5">

        </form>
<FormField/>
<FileInput/>
    </div>
  )
}

export default page