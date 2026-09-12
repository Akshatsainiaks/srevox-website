"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSubdomainUrl, isLocalEnvironment } from "@/lib/siteUrls";

export interface SubdomainLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  subdomain: string;
  path?: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
}

export function SubdomainLink({ 
  subdomain,
  path = "", 
  children, 
  className = "", 
  target,
  rel,
  onClick,
  ...rest 
}: SubdomainLinkProps) {
  const [isLocal, setIsLocal] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return isLocalEnvironment();
    }
    return process.env.NODE_ENV === "development";
  });

  useEffect(() => {
    setIsLocal(isLocalEnvironment());
  }, []);

  const href = getSubdomainUrl(subdomain, path);

  if (isLocal) {
    return (
      <Link 
        href={href} 
        className={className} 
        onClick={onClick}
        {...(rest as any)}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target={target !== undefined ? target : "_blank"}
      rel={rel !== undefined ? rel : "noopener noreferrer"}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </a>
  );
}

/** Pre-configured shortcuts */
export function DocsLink(props: Omit<SubdomainLinkProps, "subdomain">) {
  return <SubdomainLink subdomain="docs" {...props} />;
}

export function FeedbackLink(props: Omit<SubdomainLinkProps, "subdomain">) {
  return <SubdomainLink subdomain="feedback" {...props} />;
}

export function AdminLink(props: Omit<SubdomainLinkProps, "subdomain">) {
  return <SubdomainLink subdomain="admin" {...props} />;
}

export function AuditorLink(props: Omit<SubdomainLinkProps, "subdomain">) {
  return <SubdomainLink subdomain="auditor" {...props} />;
}
