import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Button, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, CameraPictureOptions, CameraCapturedPicture, FlashMode } from 'expo-camera';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedProps } from 'react-native-reanimated';

export default function HomeScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [picture, setPicture] = useState<string | null>(null);
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
        if (!cameraRef.current) {
            return;
        }
        const options: CameraPictureOptions = {
            quality: 1,
            base64: false,
            shutterSound: false,
            mirror: facing === 'front',
        };
        const { uri } = await cameraRef.current.takePictureAsync(options) as CameraCapturedPicture;
        setPicture(uri);
    };

    const handleRetakePicture = () => {
        setPicture(null);
    };

    const handleFlipCamera = () => {
        setFacing(facing === 'back' ? 'front' : 'back');
    };

    const handleFlash = () => {
        setFlash(!flash);
    };

    return (
        <GestureHandlerRootView>
        <GestureDetector gesture={doubleTap}>
        <View style={styles.container}>
        {picture ? (
            <Image source={{ uri: picture }} style={styles.camera} />
        ) : (
            <CameraView style={styles.camera} facing={facing} mirror={true} ref={cameraRef} enableTorch={flash}>
            <View style={styles.controls}>
                <TouchableOpacity style={styles.flipButton} onPress={handleFlipCamera}>
                    <IconSymbol name="camera.rotate.fill" size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shutterButton} onPress={handleTakePicture} >
                    <IconSymbol name="camera.fill" size={75} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.galleryButton} onPress={handleFlash}>
                    <MaterialIcons name={flash ? "flash-on" : "flash-off"} size={32} color="white" />
                </TouchableOpacity>
            </View>
            </CameraView>
        )}
        {picture && (
            <View style={styles.retakeButtonContainer}>
            <Button title="Retake" onPress={handleRetakePicture} />
            </View>
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
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    flipButton: {
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
    galleryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    message: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    retakeButtonContainer: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
    },
});