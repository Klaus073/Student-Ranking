"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorDetails = (errorMessage: string | null) => {
    if (!errorMessage) {
      return {
        title: "Unknown Error",
        description: "An unknown error occurred during authentication.",
        suggestions: ["Try the authentication process again", "Contact support if the issue persists"]
      };
    }

    // Database/Profile creation errors
    if (errorMessage.includes("Profile creation failed")) {
      return {
        title: "Profile Creation Error",
        description: errorMessage,
        suggestions: [
          "Check that all required fields were filled out during signup",
          "Verify your university selection is valid",
          "Try signing up again with simpler data (fewer internships/society roles)",
          "Contact support with this error message for assistance"
        ]
      };
    }

    // Email verification errors
    if (errorMessage.includes("token") || errorMessage.includes("expired")) {
      return {
        title: "Email Verification Error",
        description: "Your email verification link is invalid or has expired.",
        suggestions: [
          "Request a new verification email",
          "Check that you clicked the correct link from your email",
          "Make sure you're using the same browser/device"
        ]
      };
    }

    // Database connection errors
    if (errorMessage.includes("Database") || errorMessage.includes("connection")) {
      return {
        title: "Database Connection Error",
        description: "Unable to connect to the database to save your information.",
        suggestions: [
          "This is likely a temporary issue - please try again in a few minutes",
          "Check your internet connection",
          "Contact support if the issue persists"
        ]
      };
    }

    // Default error handling
    return {
      title: "Authentication Error",
      description: errorMessage,
      suggestions: [
        "Try the process again",
        "Clear your browser cache and cookies",
        "Contact support if the issue continues"
      ]
    };
  };

  const errorDetails = getErrorDetails(error);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl">
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">{errorDetails.title}</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
              <p className="text-red-700 text-sm break-words">{errorDetails.description}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-3">What you can try:</h3>
              <ul className="space-y-2">
                {errorDetails.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1">
                <Link href="/auth/sign-up">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Signup Again
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="flex-1">
                <Link href="/auth/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-800">Need Help?</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    If this error persists, please contact our support team with the error details above. 
                    Include the time this occurred and any steps you took before seeing this error.
                  </p>
                </div>
              </div>
            </div>

            {/* Debug Info (only show if we have detailed error) */}
            {error && error.length > 50 && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">Technical Details</summary>
                <div className="mt-2 p-3 bg-gray-100 rounded border font-mono text-xs break-all">
                  {error}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
