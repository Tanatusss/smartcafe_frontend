

function Login() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Login</h1>
        {/* <form onSubmit={onSubmit} className="mt-4 space-y-3"> */}
        <div>
          <label className="block text-sm">Email</label>
          <input className="border rounded px-3 py-2 w-full" type="email"
                />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input className="border rounded px-3 py-2 w-full" type="password"
                />
        </div>
        {/* {err && <p className="text-red-600 text-sm">{err}</p>} */}
        <button className="rounded bg-black text-white px-4 py-2 disabled:opacity-50"
                type="submit" >
          {/* {loading ? "กำลังสมัคร..." : "สมัครสมาชิก"} */}
        </button>
      {/* </form> */}
    </div>
  )
}

export default Login