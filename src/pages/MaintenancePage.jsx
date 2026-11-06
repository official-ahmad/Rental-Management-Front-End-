import React from "react";

const MaintenancePage = () => (
  <main className="maintenance-page">
    <div className="maintenance-orbit maintenance-orbit-one" />
    <div className="maintenance-orbit maintenance-orbit-two" />
    <div className="maintenance-content">
      <div className="maintenance-brand">
        Rentify<span>.software</span>
      </div>
      <div className="maintenance-illustration" aria-hidden="true">
        <div className="maintenance-window">
          <div className="maintenance-dots"><i /><i /><i /></div>
          <div className="maintenance-screen" />
          <div className="maintenance-gear">⚙</div>
          <div className="maintenance-warning">!</div>
        </div>
        <div className="maintenance-barrier"><b /><b /><b /></div>
        <div className="maintenance-cone"><b /><span /></div>
      </div>
      <h1>Website Under <strong>Maintenance</strong></h1>
      <p>We&apos;re currently working on improving your experience.<br />Please check back later.</p>
      <div className="maintenance-time">
        <span className="maintenance-clock">◷</span>
        <span><small>Estimated Downtime</small><b>A few hours</b></span>
      </div>
      <div className="maintenance-thanks"><i /> <span>♥</span> <i /></div>
      <div className="maintenance-message">Thank you for your patience!</div>
    </div>
  </main>
);

export default MaintenancePage;
