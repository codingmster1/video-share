"use client";
import FileInput from '@/components/FileInput'
import FormField from '@/components/FormField'
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from '@/constants';
import { useFileInput } from '@/lib/hooks/useFileInput';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import {
    getVideoUploadUrl,
    getThumbnailUploadUrl,
    saveVideoDetails,
  } from "@/lib/actions/video";
import { useRouter } from 'next/navigation';

  const uploadFileToBunny = (
    file: File,
    uploadUrl: string,
    accessKey: string
  ): Promise<void> =>
    fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        AccessKey: accessKey,
      },
      body: file,
    }).then((response) => {
      if (!response.ok)
        throw new Error(`Upload failed with status ${response.status}`);
    });



const page = () => {
    const router = useRouter();
const [videoDuration, setVideoDuration] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)




    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'public',
    })


    const video = useFileInput(MAX_VIDEO_SIZE)
    const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE)

    useEffect (() => {
        if(video.duration !== null) {
        setVideoDuration(video.duration)
        }
        },[video.duration])


    const [error, setError] = useState('')

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
const {name, value } = e.target;

setFormData((prevState) => ({ ...prevState, [name]: value}))
    }
const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true)
try {
if(!video.file || !thumbnail.file) {
    setError("Please upload both a video and a thumbnail.");
    return;
}
if(!formData.title || !formData.description) {
    setError('Please fill in all fields.');
    return;
}

const {
    videoId,
    uploadUrl: videoUploadUrl,
    accessKey: videoAccessKey,
} = await getVideoUploadUrl()

if(!videoUploadUrl || !videoAccessKey) throw new Error('Failed to get video upload URL');


await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey)



const {
    
    uploadUrl: thumbnailUploadUrl,
    accessKey: thumbnailAccessKey,
    cdnUrl: thumbnailCdnUrl,
} = await getThumbnailUploadUrl(videoId)




if(!thumbnailUploadUrl || !thumbnailCdnUrl || !thumbnailAccessKey) throw new Error('Failed to get video upload thumbnail');


await uploadFileToBunny(
    thumbnail.file,
    thumbnailUploadUrl,
    thumbnailAccessKey
  );

  await saveVideoDetails({
    videoId,
    thumbnailUrl: thumbnailCdnUrl,
    ...formData,
    duration: videoDuration,
  });

  router.push(`/video/${videoId}`);

} catch (error) {
    console.log('error submitting form:',error)
} finally {
    setIsSubmitting(false)
}
   
}

  return (
    <div className="wrapper-md upload-page">
        <h1>Upload a Video</h1>
        {error && <div className="error-field">{error}</div>}

        <form className="rounded-20 shadow-10 gap-6 w-full flex
        flex-col px-5 py-7.5" onSubmit={handleSubmit}>
<FormField
id="title"
label="Title"
value={formData.title}
onChange={handleInputChange}
placeholder="Enter a title for your video"
/>
<FormField
id="description"
label="Description"
value={formData.description}
onChange={handleInputChange}
as="textarea"
placeholder="Description"
/>
<FileInput
id="video"
label="Video"
accept="video/*"
file={video.file}
previewUrl={video.previewUrl}
inputRef={video.inputRef}
onChange={video.handleFileChange}
onReset={video.resetFile}
type="video"
/>

<FileInput
id="thumbnail"
label="Thumbnail"
accept="image/*"
file={thumbnail.file}
previewUrl={thumbnail.previewUrl}
inputRef={thumbnail.inputRef}
onChange={thumbnail.handleFileChange}
onReset={thumbnail.resetFile}
type="image"
/>

<FormField
id="visibility"
label="Visibility"
value={formData.visibility}
onChange={handleInputChange}
as="select"
options={[
    {value: 'public', label: 'Public'},
    {value: 'private', label: 'Private'},
]}

/>
<button type="submit" disabled={isSubmitting} className="submit-button">
    {isSubmitting ? 'Uploading...' : 'Upload Video'}
</button>
        </form>

    </div>
  )
}

export default page