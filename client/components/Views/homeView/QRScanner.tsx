import React, { useEffect, useState } from 'react'
import { Modal, StyleSheet, View, Text } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../../redux'
import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import { TabNavProp } from './homeViewNav';
import Button from '../../Button';


const mapState = (state: RootState) => ({
    socketState: state.socket
})

const mapDispatch = {

}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector> & { navigation: TabNavProp<'QRScanner'> }




const QRScanner: React.FC<Props> = ({ socketState, navigation }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [parsedData, setParsedData] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted')
        })();
    }, []);


    const handleBarCodeScan: BarCodeScannedCallback = ({ data }) => {
        setParsedData(JSON.parse(data));
        setScanned(true);
    }

    return (
        <View style={styles.container}>
            {hasPermission &&
                <BarCodeScanner
                    type='back'
                    barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                    onBarCodeScanned={handleBarCodeScan}
                    style={{ width: '100%', height: '100%' }}
                />}
            <Modal
                animationType='slide'
                visible={scanned}
                transparent={true}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modal}>
                        <Text >{JSON.stringify(parsedData)}</Text>
                        <Button title="Add" onPress={() => { setScanned(false) }} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        backgroundColor: '#FFCABE',
        height: '80%',
        width: '90%',
        borderRadius: 10,
        padding: 30
    }
})

export default connector(QRScanner);