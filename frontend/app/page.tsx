
'use client'
import React, { useState,useEffect } from 'react'
import Sidebar from '../src/components/layout/Sidebar'


export default function Page() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    
    window.location.href = "/login";
 
  }, []);

  return null;
}
