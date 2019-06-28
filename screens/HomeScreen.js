import * as WebBrowser from 'expo-web-browser';
import React, { useState, useEffect } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  Alert,
  Modal
} from 'react-native';
import * as Print from 'expo-print';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { MonoText } from '../components/StyledText';

export default function HomeScreen() {
  //printer state
  const [printer, setPrinter] = useState(null)
  const [isStartPrinting, setStartPrinting] = useState(false)
  //barcode scanner state
  const [hasCameraPermission, setCameraPermission] = useState(false)
  const [isScan, setIsScan] = useState(false)
  const [showScanModal, setScanModal] = useState(false)
  const [resource, setResource] = useState(null)

  const startPrinting = async () => {
    if (!resource) {
      alert('no resource available')
      return;
    }
    if (!printer) {
      const data = await selectPrinter()
      await setPrinter(data)
    }
    setStartPrinting(true)
  }

  const startScannerAsync = async () => {
    if (!hasCameraPermission) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      await setCameraPermission(status === 'granted')
    }
    await setResource(null)
    await setIsScan(false)
    setScanModal(true)
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    await setResource(data || '1234')
    await setIsScan(true)
    setScanModal(false)
  }

  //detect print signal and start printing
  useEffect(() => {
    if (isStartPrinting) {
      Print.printAsync({
        html: `<h1>${resource}</h1>`,
        printerUrl: printer.url
      }).then(() => setStartPrinting(false))
    }
  }, [isStartPrinting])

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={showScanModal}
        onRequestClose={() => {
          setScanModal(false)
          Alert.alert('Modal has been closed.');
        }}>
        <View style={[styles.container, { paddingVertical: 50, backgroundColor: 'black' }]}>
          <Text style={{ color: 'white' }}>{resource}</Text>
          <BarCodeScanner
            onBarCodeScanned={isScan ? undefined : handleBarCodeScanned}
            style={{ width: '100%', height: '100%' }}
          />
        </View>
      </Modal>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.welcomeContainer}>
          <Image
            source={
              __DEV__
                ? require('../assets/images/robot-dev.png')
                : require('../assets/images/robot-prod.png')
            }
            style={styles.welcomeImage}
          />
        </View>

        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={startScannerAsync} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>{isScan ? 'Scan Again' : 'Start Scan'}</Text>
          </TouchableOpacity>
        </View>

        {
          isScan && resource && (
            <View style={styles.helpContainer}>
              <TouchableOpacity onPress={startPrinting()} style={styles.helpLink}>
                <Text style={styles.helpLinkText}>Print</Text>
              </TouchableOpacity>
            </View>
          )
        }

      </ScrollView>

      <View style={styles.tabBarInfoContainer}>
        <View
          style={[styles.codeHighlightContainer, styles.navigationFilename]}>
          {
            printer ? (
              <MonoText style={styles.codeHighlightText}>
                {isStartPrinting ? 'printer is printing' : 'Printer is stand by'}
              </MonoText>
            ) : <MonoText style={styles.codeHighlightText}>
                No Printer is connected
              </MonoText>
          }
        </View>
      </View>
    </View >
  );
}

function selectPrinter() {
  return new Promise(async (resolve, reject) => {
    const data = await Print.selectPrinterAsync()
    resolve(data)
  })
}

HomeScreen.navigationOptions = {
  header: null,
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
