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
<div className="description">
<section>
  <figure>
    {Array.from({ length: 5}).map((_, index) => (
      <Image src="/assets/icons/star.svg" alt="star" width={20}
      height={20} key={index} />
    ))}
  </figure>
  <p>SnapCast makes screen recording simple like it should be!</p>
  <article>
    <Image src="/assets/images/jason.png" alt="jason" width={64} height={64}
    className="rounded-full"/>  
    <div>
      <h2>
        Jason Rivera
      </h2>
      <p>Product Designer</p>
    </div>
    </article>
</section>
</div>
<p> SnapCast {(new Date()).getFullYear()}</p>
      </aside>
      <aside className="google-sign-in">
<section>
  <Link href="/">
  <Image src="/assets/icons/logo.svg" alt="logo" width={40} height={40} />
  <h1>SnapCast</h1>
  </Link>
  <p>Create and share your very first <span>SnapCast Video </span>in no time!</p>
</section>
      </aside>
    </main>
  )
}

export default page