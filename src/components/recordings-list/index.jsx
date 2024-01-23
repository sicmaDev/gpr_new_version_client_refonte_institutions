import React, { Component }  from 'react';
import useRecordingsList from "../../hooks/use-recordings-list";
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import "./styles.css";
import { Fab } from '@mui/material';

export default function RecordingsList({ audio }) {
  const { recordings, deleteAudio } = useRecordingsList(audio);

  return (
    <div className="recordings-container">
      {recordings.length > 0 ? (
        <>
          {/* <h5 style={{textAlign: "center", fontWeight:"bold"}}>Votre enregistrement</h5> */}
          <div className="recordings-list">
            {recordings.map((record) => (
              <div className="record" key={record.key}>
                <audio controls src={window.URL.createObjectURL(record.audio) } />
                <div className="delete-button-container" style={{paddingTop: "4px"}}>
                <Fab size='small' style={{ backgroundColor: "#fd1c03", color: "white", marginLeft: "24px", marginTop: "8px"}} onClick={() => deleteAudio(record.key)}><DeleteIcon /></Fab>
                  
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-records">
          {/* <ErrorIcon color="#f2ea02" /> */}
          <span></span>
        </div>
      )}
    </div>
  );
}
