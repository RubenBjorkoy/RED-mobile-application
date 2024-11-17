import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Button, Image, Vibration, Platform } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, CameraPictureOptions, CameraCapturedPicture } from 'expo-camera';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedProps } from 'react-native-reanimated';
import { vibrate } from '@/utils/vibrate';

interface PictureProps {
    uri: string;
    orientation: number;
}

export default function HomeScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [picture, setPicture] = useState<PictureProps | null>(null);
    const [flash, setFlash] = useState<boolean>(false);

    if (!permission) {
        //This means that the permissions aren't loaded yet
        return <View />;
    }
    if (!permission.granted) {
        //This is if the permissions are denied
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
        handleFlipCamera();
    })
    .runOnJS(true);

    const handleTakePicture = async () => {
        vibrate(30);
        if (!cameraRef.current) {
            return;
        }
        const options: CameraPictureOptions = {
            quality: 1,
            base64: false,
            shutterSound: false,
            exif: true,
        };
        const picture = await cameraRef.current.takePictureAsync(options) as CameraCapturedPicture;
        console.log(picture);
        setPicture({ 
            uri: picture.uri, 
            orientation: picture.exif.Orientation,
        });
    };

    const getImageRotation = (orientation: number): string => {
        switch (orientation) {
            case 1: // Rotated left
                return '90deg';
            case 3: // Rotated right
                return '-90deg';
            case 6: // Upright Portrait
                return '0deg';
            case 8: // Rotated left
                return '180deg';
            default: // Normal
                return '0deg';
        }
    };

    const handleRetakePicture = () => {
        vibrate(15);
        setPicture(null);
    };

    const handleFlipCamera = () => {
        vibrate(15);
        setFacing(facing === 'back' ? 'front' : 'back');
    };

    const handleFlash = () => {
        vibrate(15);
        setFlash(!flash);
    };

    return (
        <GestureHandlerRootView>
        <GestureDetector gesture={doubleTap}>
        <View style={styles.container}>
        {picture ? (
            <Image
                source={{ uri: picture.uri }}
                style={[
                    styles.camera,
                    { transform: [{ rotate: getImageRotation(picture.orientation) }] },
                ]}
            />
        ) : (
            <CameraView 
                style={styles.camera} 
                facing={facing} 
                mirror={facing === "front"} 
                ref={cameraRef} 
                enableTorch={flash} 
                animateShutter={false}
                // pictureSize='176x144'
                // ratio="fill"
            >
            <View style={styles.controls}>
                <TouchableOpacity style={styles.sideButton} onPress={handleFlipCamera}>
                    <IconSymbol name="camera.rotate.fill" size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shutterButton} onPress={handleTakePicture}/>
                <TouchableOpacity style={styles.sideButton} onPress={handleFlash}>
                    <MaterialIcons name={flash ? "flash-on" : "flash-off"} size={32} color="white" />
                </TouchableOpacity>
            </View>
            </CameraView>
        )}
        {picture && (
                <TouchableOpacity style={styles.retakeButtonContainer} onPress={handleRetakePicture}>
                    <IconSymbol name="xmark" size={42} color="white" />
                </TouchableOpacity>
        )}
        </View>
        </GestureDetector>
        </GestureHandlerRootView>
    );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: Platform.OS === "ios" ? 140 : 20, // iOS navbar height isn't calculated correctly
        paddingHorizontal: 20,
    },
    sideButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    shutterButton: {
        margin: 0,
        padding: 0,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        alignSelf: 'center',
    },
    message: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    retakeButtonContainer: {
      position: 'absolute',
      top: 40,
      left: 20,
    },
    button: {
        padding: 10,
    },
    retakeButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
    },
    buttonText: {
        fontSize: 16,
        color: 'black',
    },
});