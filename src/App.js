import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const DEFAULTS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
  sessionsBeforeLongBreak: 4,
};

const App = () => {
  const [secondsLeft, setSecondsLeft] = useState(DEFAULTS.work);
  const [isActive, setIsActive] = useState(false);
  const [currentSessionType, setCurrentSessionType] = useState('Work');
  const [workSessionCount, setWorkSessionCount] = useState(0);
  
  const [habitTracker, setHabitTracker] = useState([]);
  
  const [currentGoal, setCurrentGoal] = useState('');
  
  const timerRef = useRef(null);
  
  const [showModal, setShowModal] = useState(false);

  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
    }
  };

  const stopTimer = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
  };

  const resumeTimer = () => {
    if (!isActive && secondsLeft > 0) {
      setIsActive(true);
    }
  };

  const resetTimer = (newType) => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setCurrentSessionType(newType);
    if (newType === 'Work') {
      setSecondsLeft(DEFAULTS.work);
    } else if (newType === 'Short Break') {
      setSecondsLeft(DEFAULTS.shortBreak);
    } else if (newType === 'Long Break') {
      setSecondsLeft(DEFAULTS.longBreak);
    }
  };

  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      clearInterval(timerRef.current);
      handleSessionCompletion();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, secondsLeft]);

  const handleSessionCompletion = () => {
    if (currentSessionType === 'Work') {
      setShowModal(true);
    } else {
      const goal = window.prompt('Enter your goal for the next work session:', '');
      setCurrentGoal(goal || '');
      resetTimer('Work');
    }
  };

  const handleGoalResponse = (wasSuccessful) => {
    const newSessionNumber = workSessionCount + 1;
    setHabitTracker(prev => [
      ...prev,
      { session: newSessionNumber, goal: currentGoal, success: wasSuccessful }
    ]);
    setWorkSessionCount(newSessionNumber);
    
    setShowModal(false);
    
    if (newSessionNumber % DEFAULTS.sessionsBeforeLongBreak === 0) {
      resetTimer('Long Break');
    } else {
      resetTimer('Short Break');
    }
  };

  const formatTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="app-container">
      <header>
        <h1>Pomodoro Pro</h1>
      </header>
      
      <main>
        <section className="timer-section">
          <h2>{currentSessionType} Session</h2>
          <div className="timer-display" aria-live="polite">
            {formatTime(secondsLeft)}
          </div>
          <div className="controls">
            { !isActive && secondsLeft !== DEFAULTS.work && secondsLeft !== DEFAULTS.shortBreak && secondsLeft !== DEFAULTS.longBreak ? (
              <button onClick={resumeTimer}>Resume</button>
            ) : (
              <button onClick={startTimer}>Start</button>
            )}
            <button onClick={stopTimer}>Stop</button>
          </div>
          {currentSessionType === 'Work' && (
            <div className="goal-input">
              <label htmlFor="goal">Set your goal for this work session:</label>
              <input
                type="text"
                id="goal"
                value={currentGoal}
                onChange={(e) => setCurrentGoal(e.target.value)}
                placeholder="e.g., Finish script draft"
              />
            </div>
          )}
        </section>

        <section className="tracker-section">
          <h2>Habit Tracker</h2>
          {habitTracker.length === 0 ? (
            <p>No sessions tracked yet.</p>
          ) : (
            <ul>
              {habitTracker.map((record, index) => (
                <li key={index}>
                  {record.session}. {record.goal} - {record.success ? 'Success' : 'Failure'}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer>
        <p>Pomodoro Pro - Eks Multani</p>
      </footer>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Did you complete your goal: "<strong>{currentGoal}</strong>"?</p>
            <div className="modal-buttons">
              <button onClick={() => handleGoalResponse(true)}>Yes</button>
              <button onClick={() => handleGoalResponse(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
