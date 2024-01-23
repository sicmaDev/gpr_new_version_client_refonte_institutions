import React, { Component } from 'react';
import { formatMinutes, formatSeconds } from "../../Utils/format-time";
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import MicIcon from '@mui/icons-material/Mic';
import "./styles.css";
import { Fab } from '@mui/material';

export default function RecorderControls({ recorderState, handlers, closeAction }) {
  const { recordingMinutes, recordingSeconds, initRecording } = recorderState;
  const { startRecording, saveRecording, cancelRecording } = handlers;
  const { closAction } = closeAction;

    // Utilisez closeAction comme une fonction
    const handleSaveClick = () => {
      saveRecording();
      closeAction(); // Appelez closeAction ici
    };
  
  return (
    <div className="controls-container">
      <div className="recorder-display">
        <div className="recording-time" >
          {initRecording && <div className="recording-indicator"></div>}
          <span>{formatMinutes(recordingMinutes)}</span>
          <span>:</span>
          <span>{formatSeconds(recordingSeconds)}</span>
        </div>

      </div>
      <div className="start-button-container">
        {initRecording && (
          <div className="cancel-button-container">
            <Fab style={{ backgroundColor: "#fd1c03", color: "white", marginRight: "24px" }} onClick={cancelRecording}><CloseIcon /></Fab>
            {/* <button className="cancel-button" title="Cancel recording" >
              
            </button> */}
          </div>
        )}
        {initRecording ? (

          <Fab style={{ backgroundColor: "#84cd3e", color: "white" }} disabled={recordingSeconds === 0 && recordingMinutes === 0}
            onClick={handleSaveClick}><SaveIcon  />

            </Fab>

        ) : (
          <Fab style={{ backgroundColor: "#84cd3e", color: "white" }} onClick={startRecording}><MicIcon /></Fab>

        )}
      </div>
    </div>
  );
}
