'use client'
import { useEffect, useRef, useState, FormEvent } from 'react'
import styled from 'styled-components';

export default function ChatInput() {
  const ref = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (ref.current) ref.current.focus();
  })

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })
      const data = await res.json();
      setResponse(data)
    } catch (error) {
      console.log()
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col border border-[#F4F4F4] rounded-2xl px-6 py-4 my-8 shadow-xl">
          <input
            ref={ref}
            className='outline-none'
            style={{
              
            }}
            id="message"
            type="text"
            placeholder="Ask anything"
          />
          <div>
          </div>
        </div>
      </form>
      <p>{response}</p>
    </>
  );
}
