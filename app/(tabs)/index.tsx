import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, Button, Image, Platform, Alert, BackHandler } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, CameraPictureOptions, CameraCapturedPicture } from 'expo-camera';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedProps } from 'react-native-reanimated';
import { vibrate } from '@/utils/vibrate';
import * as MediaLibrary from 'expo-media-library';
import { PermissionResponse } from 'expo-media-library';

interface PictureProps {
    uri: string;
    orientation: number;
}

function useBackButton(handler: () => void) {
    useEffect(() => {
        const listener = () => {
            handler();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', listener);

        return () => backHandler.remove();
    }, [handler]);
}

export default function HomeScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [mediaLibraryPermissionGranted, setMediaLibraryPermissionGranted] = useState<boolean>(false);
    const cameraRef = useRef<CameraView>(null);
    const [picture, setPicture] = useState<PictureProps | null>(null);
    const [flash, setFlash] = useState<boolean>(false);
    const [downloaded, setDownloaded] = useState<boolean>(false);

    useEffect(() => {
        setPicture(null);
        (async () => {
            const { granted } = await MediaLibrary.requestPermissionsAsync();
            setMediaLibraryPermissionGranted(granted);
        })();
    }, []);

    const backButtonHandler = () => {
        if (picture) {
            handleRetakePicture();
            return true;
        }
        return false;
    };

    useBackButton(backButtonHandler);

    //! Important! Make sure these come later than any hooks
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
        setDownloaded(false);
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

    const saveToLibrary = async (uri: string) => {
        try {
            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert('Success', 'Picture saved to gallery');
            setDownloaded(true);
        } catch (error) {
            Alert.alert('Error', 'Failed to save picture to gallery');
            console.error(error);
        }
    }

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
                style={styles.imagePreview}
            />
        ) : (
            <CameraView 
                style={styles.camera} 
                facing={facing} 
                mirror={facing === "front"} 
                ref={cameraRef} 
                enableTorch={flash} 
                animateShutter={false}
                ratio="4:3"
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
            <View style={styles.pictureOptions}>
                <TouchableOpacity style={styles.retakeButtonContainer} onPress={handleRetakePicture}>
                    <IconSymbol name="xmark" size={42} color="white" />
                </TouchableOpacity>
                {
                    !downloaded ? (
                        <TouchableOpacity style={styles.downloadButton} onPress={() => saveToLibrary(picture.uri)}>
                            <IconSymbol name="arrow.down.circle" size={42} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.downloadButton}>
                            <IconSymbol name="checkmark.circle" size={42} color="white" />
                        </View>
                    )
                }
                
            </View>
        )}
        </View>
        </GestureDetector>
        </GestureHandlerRootView>
    );
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
        resizeMode: 'contain',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 20,
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
    pictureOptions: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        top: 40,
        height: height - 80,
        paddingHorizontal: 20,
    },
    message: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    retakeButtonContainer: {
      zIndex: 10,
    },
    downloadButton: {
      zIndex: 10,
    },
    button: {
        padding: 10,
    },
    buttonText: {
        fontSize: 16,
        color: 'black',
    },
    imagePreview: {
        flex: 1,
        resizeMode: 'contain',
    },
});