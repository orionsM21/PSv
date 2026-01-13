import React, { memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const DrawerItem = memo(({ item, active, onPress, theme }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 60,
                width: '100%',
                backgroundColor: active
                    ? theme.light.RightRepliedColor
                    : '#FFFFFF',
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginLeft: 10,
                }}
            >
                {/* Arrow */}
                <Image source={require('../../asset/TrueBoardIcon/Arrow.png')} />

                {/* Outer pill */}
                <View
                    style={{
                        margin: 14,
                        width: width * 0.4,
                        height: height * 0.05,
                        borderRadius: 20,
                        backgroundColor: '#FB9129',
                        justifyContent: 'center',
                    }}
                >
                    {/* Inner pill */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 14,
                            width: width * 0.4,
                            height: height * 0.045,
                            borderRadius: 20,
                            backgroundColor: '#001D56',
                        }}
                    >
                        <MaterialIcons
                            name={item.icon}
                            size={20}
                            color="#FFFFFF"
                        />

                        <Text
                            style={{
                                fontSize: 15,
                                fontWeight: '400',
                                marginLeft: 12,
                                color: '#FFFFFF',
                            }}
                        >
                            {item.label}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default DrawerItem;
