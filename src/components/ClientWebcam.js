import React from 'react';
import Webcam from 'react-webcam';

const UserWebcam = React.forwardRef((props, ref) => {
    return <Webcam ref={ref} />;
});

export default UserWebcam;
