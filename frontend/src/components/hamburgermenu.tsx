"use client"

import { usePathname } from "next/navigation";


export default function HamburgerMenu() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);
  
  return (
    <section className="h-full w-small bg-[#0E1117] text-white flex flex-col"> 
    
        <div className="h-full flex items-center justify-between px-4 py-2 bg-[#0E1117]">
          <nav className="flex flex-col gap-4">
            <li><a
                href="/homepagina"
                className={
                    isActive("/homepagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                Dashboard 
            </a></li>

            <li><a
                href="/alertpagina"
                className={
                    isActive("/alertpagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                Alert Queue 
            </a></li>

            <li><a
                href="/casespagina"
                className={
                    isActive("/casespagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                Cases 
            </a></li>

            <li><a
                href="/customerpagina"
                className={
                    isActive("/customerpagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                Customers
            </a></li>

            <li><a
                href="/userpagina"
                className={
                    isActive("/userpagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                Users & Roles
            </a></li>

            <li><a
                href="/accesspagina"
                className={
                    isActive("/accesspagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                Customer Access
            </a></li>

            <li><a
                href="/retentionpagina"
                className={
                    isActive("/retentionpagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                Retention Policy
            </a></li>

            <li><a
                href="/auditpagina"
                className={
                    isActive("/auditpagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                Audit Log
            </a></li>

            <li><a
                href="/reportpagina"
                className={
                    isActive("/reportpagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                SOC Reports
            </a></li>

            <li><a
                href="/accountpagina"
                className={
                    isActive("/accountpagina")
                        ? "underline underline-offset-4"
                        : "hover:text-gray-600 transition"
                }
                >
                My Account
            </a></li>
          </nav>
        </div>
    </section>
  );
}