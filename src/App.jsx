import { useState } from 'react'
import her from './assets/test.jpg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a 
          href="https://www.instagram.com/theabbeyrosexo" 
          target="_blank"
        >
          <img 
            src={her}
            alt="React logo"
            style={{
              width: "200px",
              height: "200px",
              animation: "spin 4s linear infinite"
            }}
          />
        </a>
      </div>
      <h1>Hello sweet girl.</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Kiss Count: {count}
        </button>
      </div>
    </>
  )
}

export default App
