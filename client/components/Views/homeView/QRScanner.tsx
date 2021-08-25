import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, View, Text, StatusBar, Pressable } from 'react-native';
import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import Button from '../../Button';
import { AddBoxViewStackProp, IContextProp, NewBoxContext } from '../addBoxView/addBoxViewNav';
import { Feather } from '@expo/vector-icons';
import { LoadingHeart } from '../../loadingHeart';
import { useAppSelector } from '../../../redux';
import { BlurView } from 'expo-blur';





const QRScanner: React.FC<AddBoxViewStackProp<'qrScreen'>> = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [camSize, setCamSize] = useState(0);
    const [error, setError] = useState<null | { msg: string }>(null);
    const userBoxes = useAppSelector(state => state.user.boxes);
    const { changeBoxInfo } = useContext(NewBoxContext) as IContextProp;

    const requestPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        setLoaded(true);
    }

    useEffect(() => {
        let removeListener = navigation.addListener('transitionEnd', () => {
            requestPermissions();
        })
        return removeListener;
    }, [])


    const handleBarCodeScan: BarCodeScannedCallback = ({ data: ID }) => {
        setScanned(true);
        let alreadyAddedBox = userBoxes?.some(box => box.boxID === ID);
        if (!alreadyAddedBox) {
            changeBoxInfo({ boxID: ID });
            navigation.push('boxName');
        } else {
            setError({ msg: "You already have this box added!" });
        }
    }

    const acceptError = () => {
        setError(null);
        setTimeout(() => setScanned(false), 2000);
    }
    return (
        <View style={styles.container}>
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                <Text style={{ fontSize: 30 }}>Scanning QR Code</Text>
            </View>

            <View style={{ alignItems: 'center', flex: 7 }} onLayout={({ nativeEvent: { layout } }) => setCamSize(layout.height * 0.8)}>
                {!loaded &&
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <View style={{ paddingBottom: 80 }}>
                            <LoadingHeart />
                        </View>
                        <Text style={{ fontSize: 20 }}>Loading Camera</Text>
                    </View>
                }
                {loaded && hasPermission &&
                    <BarCodeScanner
                        type='back'
                        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScan}
                        style={{ width: '90%', height: camSize }}
                    />
                }
                {
                    loaded && !hasPermission &&
                    <View style={{ flex: 1, paddingHorizontal: '4%', justifyContent: 'center', alignItems: 'center' }}>
                        <Feather name="camera-off" size={55} color="black" />
                        <Text style={{ fontSize: 25, textAlign: 'center', paddingVertical: 30 }}>Please give the app camera permissions.</Text>
                        <Button enableShadow onPress={requestPermissions} title={<Text>Give <Feather name="camera" size={24} color="black" /> Permissions.</Text>}></Button>
                    </View >
                }
            </View>
            {error &&
                <Pressable onPress={acceptError} style={styles.errorModalContainer}>
                    <BlurView style={styles.errorBackground}>
                        <View style={styles.errorModal}>
                            <Text style={styles.errorModalText}>You already have this box added!</Text>
                        </View>
                    </BlurView>
                </Pressable>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
    },
    errorBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorModalContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    errorModal: {
        padding: 10,
        backgroundColor: '#FEF4EA',
        borderRadius: 10
    },
    errorModalText: {
        fontSize: 17
    }
})

export default QRScanner;