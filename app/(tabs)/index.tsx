import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text, TextInput, Button, Image, Platform, Alert, BackHandler, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions, CameraPictureOptions, CameraCapturedPicture } from 'expo-camera';
import { IconSymbol } from '@/components/ui/IconSymbol';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GestureDetector, Gesture, GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import Vibrate from '@/utils/vibrate';
import * as MediaLibrary from 'expo-media-library';
import { PermissionResponse } from 'expo-media-library';
import DropDownPicker from 'react-native-dropdown-picker';
import { PictureProps, ErrorProps } from '@/utils/types';
import * as Location from 'expo-location';
import { tabBarHeight, topBarPadding } from '@/constants/Measures';
import apiUrl from '@/utils/apiUrls';
import { systems } from '@/constants/Systems';
import i18next from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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
        resolved: '',
        user: "Ruben Bjørkøy",
    });
    const [system, setSystem] = useState<string>('');
    const [subsystem, setSubsystem] = useState<string>('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownItems, setDropdownItems] = useState(
        systems.map((system) => ({ label: system.name, value: system.name })),
    );
    const [subsystemDropdownOpen, setSubsystemDropdownOpen] = useState(false);
    const [subsystemDropdownItems, setSubsystemDropdownItems] = useState([
        { label: 'Wire Harness', value: 'wire-harness' },
        { label: 'Motors', value: 'motors' },
        { label: 'Telemetry', value: 'telemetry' },
    ]);
    const router = useRouter();

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
            setSubsystemDropdownItems(
                systems.find((s) => s.name === system)?.subsystems.map((subsystem) => ({
                    label: subsystem,
                    value: subsystem,
                })) || [],
            );
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

    const uploadData = async (data: ErrorProps) => {
        const userToken = await AsyncStorage.getItem('userToken');
        const errorData = {
            title: data.title,
            system: data.system,
            subsystem: data.subsystem,
            location: data.location,
            timestamp: data.timestamp,
            resolved: data.resolved,
            user: userToken,
            image: null,
        };
        const imageData = {
            image: data.image,
        };
        const imageResponse = await fetch(`${apiUrl}/images`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(imageData),
        });
        const uploadedImage = await imageResponse.json();
        errorData.image = uploadedImage.id;
        const errorResponse = await fetch(`${apiUrl}/errors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(errorData),
        });
        const uploadedError = await errorResponse.json();
        router.push(`/errors/${uploadedError.id}` as const);
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
            return;
        }
        uploadData(error);
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
            resolved: '',
            user: '',
        });
        setSystem('');
        setSubsystem('');
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
                            <View>
                                <Text style={styles.label}>{i18next.t('system')}:</Text>
                                <DropDownPicker
                                    open={dropdownOpen}
                                    value={system}
                                    items={dropdownItems}
                                    setOpen={setDropdownOpen}
                                    setValue={setSystem}
                                    setItems={setDropdownItems}
                                    zIndex={2}
                                    placeholder={i18next.t('selectSystem')}
                                    listMode='SCROLLVIEW'
                                    scrollViewProps={{
                                        persistentScrollbar: true,
                                        nestedScrollEnabled: true,
                                        decelerationRate: 'fast',
                                    }}
                                />
                                <Text style={styles.label}>{i18next.t('subsystem')}:</Text>
                                <DropDownPicker
                                    open={subsystemDropdownOpen}
                                    value={subsystem}
                                    items={subsystemDropdownItems}
                                    setOpen={setSubsystemDropdownOpen}
                                    setValue={setSubsystem}
                                    setItems={setSubsystemDropdownItems}
                                    zIndex={1}
                                    placeholder={i18next.t('selectSubsystem')}
                                    listMode='SCROLLVIEW'
                                    scrollViewProps={{
                                        persistentScrollbar: true,
                                        nestedScrollEnabled: true,
                                        decelerationRate: 'fast',
                                    }}
                                />
                                <Text style={styles.label}>{i18next.t('describeError')}:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={i18next.t('describeError')}
                                    placeholderTextColor={'#ccc'}
                                    value={error.title}
                                    multiline={true}
                                    onChangeText={(text) => setError({ ...error, title: text })}
                                />
                            </View>
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
        paddingTop: topBarPadding,
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
        height: height - tabBarHeight * 2,
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
        top: '10%',
        marginHorizontal: '10%',
        width: '80%',
        height: '70%',
        padding: "3%",
        minHeight: 400,
        paddingBottom: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 10,
        alignItems: 'center',
        zIndex: 100,
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
        maxHeight: "40%",
        width: '100%',
        minWidth: "100%",
        maxWidth: "100%",
        height: "auto"
    },
    submitButton: {
        position: 'absolute',
        backgroundColor: '#FFCF26',
        padding: 20,
        width: '100%',
        borderRadius: 5,
        alignItems: 'center',
        alignSelf: 'center',
        bottom: "3%",
        marginLeft: "3%",
        marginRight: "3%",
    },
    submitButtonText: {
        color: 'black',
        fontSize: 16,
    },
});