import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, TextInput, Button, Image, Platform, Alert, BackHandler, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, CameraPictureOptions, CameraCapturedPicture } from 'expo-camera';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import Vibrate from '@/utils/vibrate';
import * as MediaLibrary from 'expo-media-library';
import { PermissionResponse } from 'expo-media-library';
import DropDownPicker from 'react-native-dropdown-picker';
import { PictureProps, ErrorProps } from '@/utils/types';
import * as Location from 'expo-location';
import { tabBarHeight } from '@/constants/Measures';

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
    const [formVisible, setFormVisible] = useState<boolean>(false);
    const [error, setError] = useState<ErrorProps>({
        title: '',
        image: '',
        system: '',
        subsystem: '',
        location: {
            latitude: 0,
            longitude: 0,
        },
        timestamp: 0,
        resolved: false,
        user: "Ruben Bjørkøy",
    });
    const [system, setSystem] = useState<string>('');
    const [subsystem, setSubsystem] = useState<string>('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownItems, setDropdownItems] = useState([
        { label: 'Electrical', value: 'electrical' },
        { label: 'Mechanical', value: 'mechanical' },
        { label: 'Software', value: 'software' },
    ]);
    const [subsystemDropdownOpen, setSubsystemDropdownOpen] = useState(false);
    const [subsystemDropdownItems, setSubsystemDropdownItems] = useState([
        { label: 'Wire Harness', value: 'wire-harness' },
        { label: 'Motors', value: 'motors' },
        { label: 'Telemetry', value: 'telemetry' },
    ]);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if(status !== 'granted') {
                Alert.alert('Permission to access location was denied');
            } else {
                const currentLocation = await Location.getCurrentPositionAsync({});
                setError({
                    ...error,
                    location: {
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                    }
                });
            }
        })();
    }, []);

    useEffect(() => {
        setPicture(null);
        (async () => {
            const { granted } = await MediaLibrary.requestPermissionsAsync();
            setMediaLibraryPermissionGranted(granted);
        })();
    }, []);

    useEffect(() => {
        if (system) {
            setError({
                ...error,
                system: system,
            });
        }
        if (subsystem) {
            setError({
                ...error,
                subsystem: subsystem,
            });
        }
    }, [system, subsystem]);

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
        if (!cameraRef.current) {
            return;
        }
        setDownloaded(false);
        const options: CameraPictureOptions = {
            quality: 1,
            base64: true,
            shutterSound: false,
            exif: false,
        };

        const picture = await cameraRef.current.takePictureAsync(options) as CameraCapturedPicture;

        setFlash(false);

        setPicture({ 
            uri: picture.uri,
            base64: picture.base64!,
        });
        setError({
            ...error,
            image: picture.base64!,
            timestamp: Date.now(),
        })
        setFormVisible(true);
    };

    const handleFormSubmit = () => {
        if(!error.title || !system || !subsystem) {
            Alert.alert('Validation', 'Please fill out all fields');
            console.log(error.title, error.system, error.subsystem);
            return;
        }

        console.log(error.location, error.timestamp, error.resolved, error.user, error.title, system, subsystem);
        // console.log(error.image);
        Alert.alert('Success', 'Error reported');
        setError({
            title: '',
            image: '',
            system: error.system,
            subsystem: error.subsystem,
            location: {
                latitude: 0,
                longitude: 0,
            },
            timestamp: 0,
            resolved: false,
            user: '',
        });
        setFormVisible(false);
        setPicture(null);
    }

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
        Vibrate.rigid();
        setFormVisible(false);
        setPicture(null);
    };

    const handleFlipCamera = () => {
        Vibrate.light();
        setFacing(facing === 'back' ? 'front' : 'back');
    };

    const handleFlash = () => {
        setFlash(!flash);
    };

    const handleFormVisible = () => {
        Vibrate.light();
        setFormVisible(!formVisible);
    }

    return (
        <GestureHandlerRootView>
            <GestureDetector gesture={doubleTap}>
                <View style={styles.container}>
                    {picture ? (
                        <View style={styles.container}>
                            <Image source={{ uri: picture.uri }} style={styles.imagePreview} />
                            <View style={styles.pictureOptions}>
                                <TouchableOpacity
                                    style={styles.retakeButtonContainer}
                                    onPress={handleRetakePicture}
                                >
                                    <IconSymbol name="xmark" size={42} color="white" />
                                </TouchableOpacity>
                                {mediaLibraryPermissionGranted ? !downloaded ? (
                                    <TouchableOpacity
                                        style={styles.downloadButton}
                                        onPress={() => saveToLibrary(picture.uri)}
                                    >
                                        <IconSymbol name="arrow.down.circle" size={42} color="white" />
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.downloadButton}>
                                        <IconSymbol name="checkmark.circle" size={42} color="white" />
                                    </View>
                                ) : null}
                            </View>
                        </View>
                    ) : (
                        <CameraView
                            style={styles.camera}
                            facing={facing}
                            mirror={true}
                            ref={cameraRef}
                            enableTorch={flash}
                            animateShutter={false}
                            ratio="4:3"
                        >
                            <View style={styles.secondaryControls}>
                                <TouchableOpacity style={styles.sideButton} onPress={handleFormVisible}>
                                    <Text style={{color: "white"}}>Open forms</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.controls}>
                                <TouchableOpacity style={styles.sideButton} onPress={handleFlipCamera}>
                                    <IconSymbol name="camera.rotate.fill" size={32} color="white" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.shutterButton}
                                    onPress={handleTakePicture}
                                />
                                <TouchableOpacity style={styles.sideButton} onPress={handleFlash}>
                                    <MaterialIcons
                                        name={flash ? 'flash-on' : 'flash-off'}
                                        size={32}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            </View>
                        </CameraView>
                    )}
                    {formVisible && (
                        
                        <View style={styles.formOverlay}>
                        <Text style={styles.label}>Error Title:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Describe the error"
                            placeholderTextColor={'#ccc'}
                            value={error.title}
                            onChangeText={(text) => setError({ ...error, title: text })}
                        />
                        <Text style={styles.label}>System:</Text>
                        <DropDownPicker
                            style={{ zIndex: 1000 }}
                            open={dropdownOpen}
                            value={system}
                            items={dropdownItems}
                            setOpen={setDropdownOpen}
                            setValue={setSystem}
                            setItems={setDropdownItems}
                        />
                        <Text style={styles.label}>Subsystem:</Text>
                        <DropDownPicker
                            open={subsystemDropdownOpen}
                            value={subsystem}
                            items={subsystemDropdownItems}
                            setOpen={setSubsystemDropdownOpen}
                            setValue={setSubsystem}
                            setItems={setSubsystemDropdownItems}
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleFormSubmit}
                        >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
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
        marginBottom: tabBarHeight,
        padding: 0,
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
        paddingHorizontal: 20,
    },
    secondaryControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    formOverlay: {
        position: 'absolute',
        top: '20%', // Centers the form vertically
        left: '10%', // Adds space from the left side
        right: '10%', // Adds space from the right side
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Semi-transparent dark background
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10, // Adds a shadow effect for Android
        zIndex: 100, // Ensures the form stays above other components
    },
    form: {
        position: 'absolute',
        top: 50,
        padding: 20,
        backgroundColor: 'white',
        width: '90%',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: 'white',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 16,
        color: 'white',
    },
    submitButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
    },
});