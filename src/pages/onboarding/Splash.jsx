const Splash = () => {
  return (
    <div className="theme-shell flex min-h-screen items-center justify-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black"
        style={{
          background: "linear-gradient(135deg, var(--accent-color), var(--accent-strong-color))",
          color: "var(--accent-contrast-color)",
        }}
      >
        F
      </div>
    </div>
  )
}

export default Splash