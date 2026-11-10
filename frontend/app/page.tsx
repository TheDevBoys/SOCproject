"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    
    window.location.href = "/homepagina";
 
  }, []);

  return null;
}