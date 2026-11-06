import React from "react";
import styled from "styled-components";

const Loader = ({ label = "Loading..." }) => (
  <StyledWrapper role="status" aria-label={label}>
    <div className="spinner" aria-hidden="true">
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
    <span className="label">{label}</span>
  </StyledWrapper>
);

const StyledWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 24px;
  background: #f8fafc;
  color: #334155;
  box-sizing: border-box;

  .spinner {
    width: clamp(48px, 12vw, 60px);
    height: clamp(48px, 12vw, 60px);
    position: relative;
  }

  .spinner .dot {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    animation: spin 2s infinite linear;
  }

  .spinner .dot::after {
    content: "";
    width: clamp(6px, 1.8vw, 7px);
    height: clamp(6px, 1.8vw, 7px);
    border-radius: 50%;
    background-color: rgb(12, 180, 231);
    box-shadow: 0 0 12px rgba(12, 180, 231, 0.35);
  }

  .spinner .dot:nth-child(2) { animation-delay: 100ms; }
  .spinner .dot:nth-child(3) { animation-delay: 200ms; }
  .spinner .dot:nth-child(4) { animation-delay: 300ms; }
  .spinner .dot:nth-child(5) { animation-delay: 400ms; }

  .label {
    font-size: clamp(12px, 2vw, 14px);
    font-weight: 600;
    text-align: center;
    color: #64748b;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner .dot { animation-duration: 4s; }
  }
`;

export default Loader;
