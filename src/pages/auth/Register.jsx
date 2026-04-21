import { Link } from "react-router-dom"
import Button from "../../components/ui/Button"
import Input from "../../components/ui/Input"
import Card from "../../components/ui/Card"

const Register = () => {
  return (
    <div className="theme-shell flex min-h-screen items-center justify-center px-4">
      
      <Card className="w-full max-w-md">
        {/* Title */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Start tracking your expenses with FinSight
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Ayush Baware"
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
          />

          {/* Submit */}
          <Button className="w-full">
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="theme-link font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default Register
