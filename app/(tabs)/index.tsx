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
import { PictureProps, ErrorProps, LocationProps } from '@/utils/types';
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

const REVOLVE_COORDS: LocationProps = {
    latitude: 63.40893139771447,
    longitude: 10.406951423569307,
};

const { height } = Dimensions.get('window');

const MIN_FORM_HEIGHT = 20;
const SCROLL_SPEED_SCALE = 30;

export default function HomeScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [mediaLibraryPermissionGranted, setMediaLibraryPermissionGranted] = useState<boolean>(false);
    const cameraRef = useRef<CameraView>(null);
    const [picture, setPicture] = useState<PictureProps | null>(null);
    const [flash, setFlash] = useState<boolean>(false);
    const [downloaded, setDownloaded] = useState<boolean>(false);
    const [error, setError] = useState<ErrorProps>({
        title: '',
        image: '',
        system: '',
        subsystem: '',
        location: REVOLVE_COORDS,
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
    const formHeight = useSharedValue(0);
    const startHeight = useSharedValue(0);
    const [formOpen, setFormOpen] = useState(false);
    const [isInsideDropdown, setIsInsideDropdown] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if(status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                setError({
                    ...error,
                    location: REVOLVE_COORDS,
                });
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
            closeForm();
            return true;
        }
        closeForm();
        return false;
    };

    const uploadData = async (data: ErrorProps) => {
        const userToken = await AsyncStorage.getItem('userToken');
        const errorData = {
            title: data.title,
            system: data.system,
            subsystem: data.subsystem,
            location: data.location,
            timestamp: data.timestamp !== 0 ? data.timestamp : Date.now(),
            resolved: data.resolved,
            user: userToken,
            image: null,
        };
        const imageData = {
            image: data.image,
        };
        if(imageData.image !== '') {
            const imageResponse = await fetch(`${apiUrl}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(imageData),
            });
            const uploadedImage = await imageResponse.json();
            errorData.image = uploadedImage.id;
        }
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
        runOnJS(openForm)();
    };

    const openForm = () => {
        formHeight.value = withSpring(height * 0.7, { damping: 20 });
        setFormOpen(true);
    };

    const closeForm = () => {
        formHeight.value = withSpring(MIN_FORM_HEIGHT, { damping: 20 });
        setFormOpen(false);
    }

    const gesture = Gesture.Pan()
        .onBegin(() => {
            if(isInsideDropdown) {
                return;
            }
            startHeight.value = formHeight.value;
        })
        .onUpdate((event) => {
            if(isInsideDropdown) {
                return;
            }
            formHeight.value = Math.max(MIN_FORM_HEIGHT, Math.min(height * 0.7, startHeight.value - event.translationY));
        })
        .onEnd(() => {
            if(isInsideDropdown) {
                return;
            }
            if(formOpen) {
                if(formHeight.value < height * 0.65) {
                    runOnJS(closeForm)();
                } else {
                    runOnJS(openForm)();
                }
            } else {
                if(formHeight.value > height * 0.1) {
                    runOnJS(openForm)();
                } else {
                    runOnJS(closeForm)();
                }
            }
        });

    const formStyle = useAnimatedStyle(() => ({
        height: formHeight.value,
    }));

    const handleFormSubmit = () => {
        if(!error.title || !system || !subsystem) {
            Alert.alert(i18next.t('validation'), i18next.t('fillAllFields'));
            return;
        }
        uploadData(error);
        setError({
            ...error,
            title: '',
            image: '',
            system: error.system,
            subsystem: error.subsystem,
            timestamp: 0,
            resolved: '',
            user: '',
        });
        setSystem('');
        setSubsystem('');
        setPicture(null);
    }

    const saveToLibrary = async (uri: string) => {
        try {
            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert(i18next.t('success'), i18next.t('pictureSaved'));
            setDownloaded(true);
        } catch (error) {
            Alert.alert(i18next.t('error'), i18next.t('pictureNotSaved'));
            console.error(error);
        }
    }

    const handleRetakePicture = () => {
        Vibrate.rigid();
        closeForm();
        setPicture(null);
    };

    const handleFlipCamera = () => {
        Vibrate.light();
        setFacing(facing === 'back' ? 'front' : 'back');
    };

    const handleFlash = () => {
        setFlash(!flash);
    };

    //! Important! Make sure these come later than any hooks
    if (!permission) {
        return <View />;
    }
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>{i18next.t('cameraPermissions')}</Text>
                <Button onPress={requestPermission} title={i18next.t('grantPermission')} />
            </View>
        );
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
                            <View style={styles.controlsContainer}>
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
                                            color={flash ? '#FFCF26' : 'white'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </CameraView>
                    )}
                    <GestureDetector gesture={gesture}>
                        <Animated.View style={[styles.formOverlay, formStyle]}>
                            <View style={styles.handle} />
                            <View style={styles.formContent}>
                                <Text style={styles.label}>{i18next.t('system')}:</Text>
                                <DropDownPicker
                                    style={styles.dropdownStyle}
                                    badgeColors={['#FFCF26']}
                                    open={dropdownOpen}
                                    value={system}
                                    items={dropdownItems}
                                    setOpen={(open) => {
                                        setDropdownOpen(open);
                                    }}
                                    setValue={setSystem}
                                    setItems={setDropdownItems}
                                    zIndex={2}
                                    placeholder={i18next.t('selectSystem')}
                                    listMode='MODAL'
                                    modalProps={{ animationType: 'slide' }}
                                    modalTitle={i18next.t('selectSystem')}
                                    modalContentContainerStyle={styles.modalStyle}
                                    modalTitleStyle={styles.modalContentTitle}
                                    textStyle={styles.modalContentText}
                                    theme="DARK"
                                />
                                <Text style={styles.label}>{i18next.t('subsystem')}:</Text>
                                <DropDownPicker
                                    style={styles.dropdownStyle}
                                    open={subsystemDropdownOpen}
                                    value={subsystem}
                                    items={subsystemDropdownItems}
                                    setOpen={(open) => {
                                        setSubsystemDropdownOpen(open);
                                    }}
                                    setValue={setSubsystem}
                                    setItems={setSubsystemDropdownItems}
                                    zIndex={1}
                                    placeholder={i18next.t('selectSubsystem')}
                                    listMode='MODAL'
                                    modalProps={{ animationType: 'slide' }}
                                    modalTitle={i18next.t('selectSubsystem')}
                                    modalContentContainerStyle={styles.modalStyle}
                                    modalTitleStyle={styles.modalContentTitle}
                                    textStyle={styles.modalContentText}
                                    theme="DARK"
                                />
                                <Text style={styles.label}>{i18next.t('describeError')}:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={i18next.t('describeError')}
                                    placeholderTextColor={'#ccc'}
                                    value={error.title}
                                    multiline={true}
                                    numberOfLines={4}
                                    onChangeText={(text) => setError({ ...error, title: text })}
                                />
                                <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleFormSubmit}
                                >
                                    <Text style={styles.submitButtonText}>{i18next.t('submit')}</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: tabBarHeight,
        paddingTop: topBarPadding,
        position: 'relative'
    },  
    camera: {
        flex: 1,
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        zIndex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    sideButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    shutterButton: {
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
        bottom: 0,
        width: '100%',
        backgroundColor: '#000',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        zIndex: 4,
        minHeight: MIN_FORM_HEIGHT,
    },
    handle: {
        width: 120,
        height: 6,
        backgroundColor: '#FFCF26',
        borderRadius: 3,
        alignSelf: 'center',
        marginVertical: 10,
    },
    formContent: {
        padding: 20,
        zIndex: 4,
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
        fontSize: 16,
        color: 'white',
        maxHeight: "40%",
        width: '100%',
        minWidth: "100%",
        maxWidth: "100%",
        height: "auto"
    },
    submitButton: {
        backgroundColor: '#FFCF26',
        padding: 12,
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
        fontSize: 20,
    },
    dropdownStyle: {
        backgroundColor: '#171717',
        borderColor: '#171717',
    },
    modalStyle: {
        backgroundColor: '#171717',
        padding: 16,
        borderRadius: 8,
        color: 'white',
    },
    modalContentTitle: {
        backgroundColor: '#171717',
        padding: 16,
        borderRadius: 8,
        color: 'white',
    },
    modalContentText: {
        backgroundColor: '#171717',
        color: 'white',
        fontSize: 16,
    },
});