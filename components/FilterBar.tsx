import React from 'react';
import { View, StyleSheet, TextInput, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import i18next from 'i18next';
import { systems } from '@/constants/Systems';

export default function FilterBar({ onFilterChange }: { onFilterChange: (filter: { search: string, system: string, subsystem: string }) => void }) {
    const [search, setSearch] = React.useState<string>('');
    const [system, setSystem] = React.useState<string>('');
    const [subsystem, setSubsystem] = React.useState<string>('');
    const [systemDropdownOpen, setSystemDropdownOpen] = React.useState<boolean>(false);
    const [subsystemDropdownOpen, setSubsystemDropdownOpen] = React.useState<boolean>(false);
    const [systemDropdownItems, setSystemDropdownItems] = React.useState<{ label: string, value: string }[]>([]);
    const [subsystemDropdownItems, setSubsystemDropdownItems] = React.useState<{ label: string, value: string }[]>([]);

    React.useEffect(() => {
        fetchSystems();
    }, []);

    React.useEffect(() => {
        fetchSubsystems();
    }, [system]);

    React.useEffect(() => {
        onFilterChange({ search, system, subsystem });
    }, [search, system, subsystem]);

    const fetchSystems = async () => {
        const systemItems = systems.map(system => {
            return { label: system.name, value: system.name };
        });
        setSystemDropdownItems([{label: i18next.t('all'), value: ""}, ...systemItems]);
    }

    const fetchSubsystems = async () => {
        const subsystemItems = systems.find(s => s.name === system)?.subsystems.map(subsystem => {
            return { label: subsystem, value: subsystem };
        });
        setSubsystemDropdownItems([{label: i18next.t('all'), value: ""}, ...(subsystemItems || [])]);
    }

    return (
        <View>
            <ThemedView>
                <TextInput
                    placeholder={i18next.t('search')}
                    placeholderTextColor={'#aaaaaa'}
                    style={styles.input}
                    value={search}
                    onChangeText={setSearch}
                />
            </ThemedView>
            <ThemedView>
                <DropDownPicker
                    open={systemDropdownOpen}
                    value={system}
                    items={systemDropdownItems}
                    setOpen={setSystemDropdownOpen}
                    setValue={setSystem}
                    setItems={setSystemDropdownItems}
                    zIndex={2}
                    listMode='SCROLLVIEW'
                    dropDownContainerStyle={{ zIndex: 2, maxHeight: "600%" }}
                    scrollViewProps={{
                        persistentScrollbar: true,
                        nestedScrollEnabled: true,
                        decelerationRate: 'fast',
                    }}
                />
                <DropDownPicker
                    open={subsystemDropdownOpen}
                    value={subsystem}
                    items={subsystemDropdownItems}
                    setOpen={setSubsystemDropdownOpen}
                    setValue={setSubsystem}
                    setItems={setSubsystemDropdownItems}
                    zIndex={1}
                    listMode='SCROLLVIEW'
                    dropDownContainerStyle={{ zIndex: 1, maxHeight: "600%" }}
                    scrollViewProps={{
                        persistentScrollbar: true,
                        nestedScrollEnabled: true,
                        decelerationRate: 'fast',
                    }}
                />
            </ThemedView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 'auto',
        padding: 16,
        borderBottomColor: '#aaaaaa',
    },
    setColorDark: {
        color: '#000000',
    },
    image: {
        width: 200,
        height: 200,
    },
    titleContainer: {
        padding: 16,
        borderBottomColor: '#aaaaaa',
        borderBottomWidth: 1,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        color: 'white',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: 'white',
    },
});