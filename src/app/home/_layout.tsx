import { SelectedLocationProvider } from "@/contexts/SelectedLocationContext"
import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useEffect, useState } from "react"
import { StyleSheet } from "react-native"
import { storage } from "@/services/storage"

const TAB_BAR_BG = "#E8E4F0"
const ACTIVE_COLOR = "#15104D"
const INACTIVE_COLOR = "#9E9E9E"

type UserWithAnonimo = { anonimo?: boolean } | null

export default function HomeTabLayout() {
    const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null)

    useEffect(() => {
        let mounted = true
        storage.getUser().then((user) => {
            if (mounted) {
                setIsAnonymous(Boolean((user as UserWithAnonimo)?.anonimo))
            }
        })
        return () => {
            mounted = false
        }
    }, [])

    return (
        <SelectedLocationProvider>
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: ACTIVE_COLOR,
                tabBarInactiveTintColor: INACTIVE_COLOR,
                tabBarLabelStyle: styles.tabBarLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Mapa",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "map" : "map-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="relatar-animal"
                options={{
                    title: "Relatar Animal",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "paw" : "paw-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: "Perfil",
                    href: isAnonymous === true ? null : "/home/perfil",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="animal/[id]"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="selecionar-local"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="procurar-ongs"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="publicacao/[id]"
                options={{
                    href: null,
                }}
            />
        </Tabs>
        </SelectedLocationProvider>
    )
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: TAB_BAR_BG,
        borderTopWidth: 0,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: "500",
    },
})
