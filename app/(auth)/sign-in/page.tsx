import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <main className="sign-in">
      <aside className="testimonial">
<Link href="/">
<Image src="/assets/icons/logo.svg" alt="logo" width={32} height={32} />
<h1>SnapCast</h1>
</Link>
      </aside>
    </main>
  )
}

export default page