import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';

interface ClusterMarkerProps {
    pointCount: number;
    onPress: () => void;
}

export default function clusterMarker(props: ClusterMarkerProps) {
    return (
        <TouchableOpacity style={Styles.container} onPress={props.onPress}>
            <View style={Styles.bubble}>
                <ThemedText style={Styles.count}>{props.pointCount}</ThemedText>
            </View>
        </TouchableOpacity>
    );
}

const Styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        alignSelf: "flex-start"
    },
    bubble: {
        flex: 0,
        flexDirection: "row",
        alignSelf: "flex-start",
        backgroundColor: "#ffbbbb",
        padding: 4,
        borderRadius: 4,
        borderColor: "#ffbbbb",
        borderWidth: 1
    },
    count: {
        color: "#fff",
        fontSize: 13
    }
});