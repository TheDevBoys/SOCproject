'use client'
import React, { useState } from 'react'
import Sidebar from '../src/components/layout/Sidebar'


export default function Page() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div>
      <h1>Hello, Next.js!</h1>
      <p>This is in your facex</p>
    </div>
  )
}
