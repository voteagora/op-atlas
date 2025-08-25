"use client"

import * as Sentry from "@sentry/nextjs"
import React, { Component, ErrorInfo, ReactNode } from "react"

import Error from "@/app/error"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    // Send error to Sentry
    Sentry.captureException(error)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <Error />
    }

    return this.props.children
  }
}

export default ErrorBoundary
