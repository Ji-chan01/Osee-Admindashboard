/**
 * O See – Mobile Campus Navigator
 * Admin Homepage – React Native Expo (JavaScript)
 *
 * Same dependencies as other screens +
 *   react-native-svg (for column chart)
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Easing,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path, Circle, Rect, Line, G, Text as SvgText,
  Defs, LinearGradient as SvgGrad, Stop,
} from 'react-native-svg';
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';

// ─── Theme ────────────────────────────────────────────────────────────────────
const C = {
  maroon:      '#6B0F1A',
  maroonDark:  '#3D0009',
  maroonLight: '#B03045',
  maroonFaint: 'rgba(107,15,26,0.07)',
  white:       '#FFFFFF',
  black:       '#1A1A1A',
  charcoal:    '#374151',
  gray:        '#9CA3AF',
  grayMid:     '#6B7280',
  grayLight:   '#E5E7EB',
  grayFaint:   '#F3F4F6',
  gold:        '#C9A96E',
  goldDark:    '#A8824A',
  goldFaint:   'rgba(201,169,110,0.1)',
  blue:        '#3B82F6',
  blueFaint:   'rgba(59,130,246,0.1)',
  green:       '#16A34A',
  greenFaint:  'rgba(22,163,74,0.1)',
  orange:      '#EA580C',
  orangeFaint: 'rgba(234,88,12,0.1)',
  purple:      '#7C3AED',
  purpleFaint: 'rgba(124,58,237,0.1)',
};

const { width: SW, height: SH } = Dimensions.get('window');
const MENU_WIDTH = SW * 0.75;

// ─── Static computations (outside components — never recreated on render) ─────
// FIX: Moved from inside ColumnChart to avoid recomputing every render
const MAX_CHART_VAL = Math.max(...[87, 74, 61, 55, 48, 39]);

// FIX: Computed once at module load instead of on every render
const TODAY_LABEL = new Date().toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
});

// ─── Sample data ──────────────────────────────────────────────────────────────
const STATS = {
  nodes: 142,
  edges: 287,
  users: 1_438,
};

const HISTORY = [
  { id: 1,  action: 'Node Added',    detail: 'Room 412 – Ipil Building',      user: 'admin',    time: '2 mins ago',  type: 'add',    date: '2024-06-10' },
  { id: 2,  action: 'Edge Updated',  detail: 'Acacia Hall → Admin Office',    user: 'admin',    time: '18 mins ago', type: 'edit',   date: '2024-06-10' },
  { id: 3,  action: 'Node Deleted',  detail: 'Old Gate – Entrance',           user: 'jdoe',     time: '1 hr ago',    type: 'delete', date: '2024-06-10' },
  { id: 4,  action: 'Edge Added',    detail: 'Library → Computer Lab 2',      user: 'admin',    time: '3 hrs ago',   type: 'add',    date: '2024-06-09' },
  { id: 5,  action: 'Event Created', detail: 'Foundation Day – Main Plaza',   user: 'mcruz',    time: '5 hrs ago',   type: 'event',  date: '2024-06-09' },
  { id: 6,  action: 'Node Updated',  detail: 'Guidance Office – Main Bldg',   user: 'admin',    time: 'Yesterday',   type: 'edit',   date: '2024-06-09' },
  { id: 7,  action: 'Edge Deleted',  detail: 'Old Path – Science Bldg',       user: 'jdoe',     time: 'Yesterday',   type: 'delete', date: '2024-06-08' },
  { id: 8,  action: 'Node Added',    detail: 'Comfort Room – Gym Building',   user: 'mcruz',    time: '2 days ago',  type: 'add',    date: '2024-06-07' },
  { id: 9,  action: 'Edge Updated',  detail: 'Chapel → Canteen',              user: 'admin',    time: '2 days ago',  type: 'edit',   date: '2024-06-07' },
  { id: 10, action: 'Event Updated', detail: 'Sportsfest – Gymnasium',        user: 'jdoe',     time: '3 days ago',  type: 'event',  date: '2024-06-06' },
  { id: 11, action: 'Node Deleted',  detail: 'Old Canteen – South Wing',      user: 'admin',    time: '3 days ago',  type: 'delete', date: '2024-06-06' },
  { id: 12, action: 'Edge Added',    detail: 'Gymnasium → Covered Walk',      user: 'mcruz',    time: '4 days ago',  type: 'add',    date: '2024-06-05' },
];

// FIX: Sliced once at module level — no need to slice on every render
const HISTORY_PREVIEW = HISTORY.slice(0, 5);

const ALL_PATHS_DATA = [
  { id: 1,  from: 'Acacia Hall',      to: 'Library',         value: 87,  month: 6, year: 2024 },
  { id: 2,  from: 'Main Gate',        to: 'Admin Office',    value: 74,  month: 6, year: 2024 },
  { id: 3,  from: 'Cafeteria',        to: 'Gymnasium',       value: 61,  month: 6, year: 2024 },
  { id: 4,  from: 'Computer Lab',     to: 'Room 401',        value: 55,  month: 6, year: 2024 },
  { id: 5,  from: 'Library',          to: 'Computer Lab 2',  value: 48,  month: 6, year: 2024 },
  { id: 6,  from: 'Chapel',           to: 'Admin Office',    value: 39,  month: 6, year: 2024 },
  { id: 7,  from: 'Ipil Building',    to: 'Library',         value: 35,  month: 6, year: 2024 },
  { id: 8,  from: 'Guidance Office',  to: 'Main Gate',       value: 30,  month: 6, year: 2024 },
  { id: 9,  from: 'Science Bldg',     to: 'Computer Lab',    value: 28,  month: 6, year: 2024 },
  { id: 10, from: 'Gymnasium',        to: 'Canteen',         value: 24,  month: 6, year: 2024 },
  { id: 11, from: 'Acacia Hall',      to: 'Admin Office',    value: 91,  month: 5, year: 2024 },
  { id: 12, from: 'Library',          to: 'Guidance Office', value: 67,  month: 5, year: 2024 },
  { id: 13, from: 'Main Gate',        to: 'Chapel',          value: 53,  month: 5, year: 2024 },
  { id: 14, from: 'Cafeteria',        to: 'Gymnasium',       value: 49,  month: 5, year: 2024 },
  { id: 15, from: 'Room 401',         to: 'Library',         value: 40,  month: 5, year: 2024 },
  { id: 16, from: 'Chapel',           to: 'Canteen',         value: 33,  month: 5, year: 2024 },
  { id: 17, from: 'Computer Lab 2',   to: 'Admin Office',    value: 27,  month: 5, year: 2024 },
  { id: 18, from: 'Ipil Building',    to: 'Gymnasium',       value: 22,  month: 5, year: 2024 },
  { id: 19, from: 'Science Bldg',     to: 'Library',         value: 79,  month: 4, year: 2024 },
  { id: 20, from: 'Main Gate',        to: 'Library',         value: 64,  month: 4, year: 2024 },
  { id: 21, from: 'Acacia Hall',      to: 'Gymnasium',       value: 58,  month: 4, year: 2024 },
  { id: 22, from: 'Cafeteria',        to: 'Admin Office',    value: 45,  month: 4, year: 2024 },
  { id: 23, from: 'Chapel',           to: 'Library',         value: 37,  month: 4, year: 2024 },
  { id: 24, from: 'Guidance Office',  to: 'Computer Lab',    value: 29,  month: 4, year: 2024 },
];

const CHART_DATA = [
  { label: 'Acacia→\nLib',   value: 87  },
  { label: 'Gate→\nAdmin',   value: 74  },
  { label: 'Cafe→\nGym',     value: 61  },
  { label: 'Lab→\nRoom 401', value: 55  },
  { label: 'Library→\nLab2', value: 48  },
  { label: 'Chapel→\nAdmin', value: 39  },
];

const AVAILABLE_MONTHS = [
  { label: 'All Months', month: null, year: null },
  { label: 'June 2024',  month: 6,    year: 2024 },
  { label: 'May 2024',   month: 5,    year: 2024 },
  { label: 'April 2024', month: 4,    year: 2024 },
];

const ADMIN_USERS = ['All Admins', 'admin', 'jdoe', 'mcruz'];

const MENU_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard',    icon: 'grid'   },
  { id: 'User Management',  label: 'User Management',    icon: 'grid'   },
  { id: 'map',        label: 'Map Overview', icon: 'map'    },
  { id: 'nodes',      label: 'Manage Nodes', icon: 'node'   },
  { id: 'edges',      label: 'Manage Edges', icon: 'edge'   },
  { id: 'events',     label: 'Manage Events',icon: 'event'  },
  { id: 'backtoapp',  label: 'Back to App',  icon: 'back'   },
  { id: 'logout',     label: 'Logout',       icon: 'logout' },
];

// History type config
const HISTORY_TYPE = {
  add:    { color: C.green,    bg: C.greenFaint,           label: 'ADD'   },
  edit:   { color: C.blue,     bg: C.blueFaint,            label: 'EDIT'  },
  delete: { color: '#EF4444',  bg: 'rgba(239,68,68,0.1)',  label: 'DEL'   },
  event:  { color: C.orange,   bg: C.orangeFaint,          label: 'EVENT' },
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconMenu = ({ size = 22, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="6"  x2="21" y2="6"  stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="18" x2="15" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const IconClose = ({ size = 20, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const IconGrid = ({ size = 18, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3"  y="3"  width="7" height="7" rx="1" stroke={color} strokeWidth="1.7" />
    <Rect x="14" y="3"  width="7" height="7" rx="1" stroke={color} strokeWidth="1.7" />
    <Rect x="3"  y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.7" />
    <Rect x="14" y="14" width="7" height="7" rx="1" stroke={color} strokeWidth="1.7" />
  </Svg>
);

const IconMap = ({ size = 18, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 3L3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    <Line x1="9"  y1="3"  x2="9"  y2="18" stroke={color} strokeWidth="1.7" />
    <Line x1="15" y1="6"  x2="15" y2="21" stroke={color} strokeWidth="1.7" />
  </Svg>
);

const IconNode = ({ size = 18, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.7" />
    <Circle cx="4"  cy="4"  r="2" stroke={color} strokeWidth="1.5" />
    <Circle cx="20" cy="4"  r="2" stroke={color} strokeWidth="1.5" />
    <Circle cx="4"  cy="20" r="2" stroke={color} strokeWidth="1.5" />
    <Circle cx="20" cy="20" r="2" stroke={color} strokeWidth="1.5" />
    <Line x1="6"  y1="6"  x2="9"  y2="9"  stroke={color} strokeWidth="1.3" />
    <Line x1="18" y1="6"  x2="15" y2="9"  stroke={color} strokeWidth="1.3" />
    <Line x1="6"  y1="18" x2="9"  y2="15" stroke={color} strokeWidth="1.3" />
    <Line x1="18" y1="18" x2="15" y2="15" stroke={color} strokeWidth="1.3" />
  </Svg>
);

const IconEdge = ({ size = 18, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="5"  cy="12" r="3" stroke={color} strokeWidth="1.7" />
    <Circle cx="19" cy="12" r="3" stroke={color} strokeWidth="1.7" />
    <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.7" strokeDasharray="2,2" />
    <Path d="M13 9l3 3-3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconEvent = ({ size = 18, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.7" />
    <Line x1="16" y1="2"  x2="16" y2="6"  stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Line x1="8"  y1="2"  x2="8"  y2="6"  stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Line x1="3"  y1="10" x2="21" y2="10" stroke={color} strokeWidth="1.7" />
    <Circle cx="8"  cy="15" r="1" fill={color} />
    <Circle cx="12" cy="15" r="1" fill={color} />
    <Circle cx="16" cy="15" r="1" fill={color} />
  </Svg>
);

const IconBackApp = ({ size = 18, color = C.white }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M12 5l-7 7 7 7" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconLogout = ({ size = 18, color = '#EF4444' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    <Path d="M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const IconSearch = ({ size = 16, color = C.gray }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
    <Path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// FIX: Simplified IconSort — single path, flipped with SVG transform instead of branching
const IconSort = ({ size = 16, color = C.maroon, asc = true }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G transform={asc ? undefined : 'scale(1,-1) translate(0,-24)'}>
      <Path d="M3 6h18M6 12h12M9 18h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </G>
  </Svg>
);

const IconChevronDown = ({ size = 14, color = C.maroon }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Rank helpers (module-level pure functions) ───────────────────────────────
const rankColor = (rank) => {
  if (rank === 1) return '#F59E0B';
  if (rank === 2) return '#9CA3AF';
  if (rank === 3) return '#C2855A';
  return C.maroon;
};

const rankBg = (rank) => {
  if (rank === 1) return 'rgba(245,158,11,0.12)';
  if (rank === 2) return 'rgba(156,163,175,0.12)';
  if (rank === 3) return 'rgba(194,133,90,0.12)';
  return C.maroonFaint;
};

// ─── Shared HistoryRow component (FIX: extracted to avoid duplicate JSX) ──────
const HistoryRow = ({ item, isLast }) => {
  const t = HISTORY_TYPE[item.type];
  return (
    <View style={[styles.historyItem, isLast && { borderBottomWidth: 0 }]}>
      <View style={[styles.historyBadge, { backgroundColor: t.bg }]}>
        <Text style={[styles.historyBadgeText, { color: t.color }]}>{t.label}</Text>
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyAction}>{item.action}</Text>
        <Text style={styles.historyDetail} numberOfLines={1}>{item.detail}</Text>
        <View style={styles.historyMeta}>
          <Text style={styles.historyUser}>@{item.user}</Text>
          <Text style={styles.historyDot}>·</Text>
          <Text style={styles.historyTime}>{item.time}</Text>
        </View>
      </View>
      <View style={[styles.historyDotRight, { backgroundColor: t.color }]} />
    </View>
  );
};

// ─── Column Chart ─────────────────────────────────────────────────────────────
const ColumnChart = () => {
  // FIX: anim array refs are stable — useRef array init is fine, but extracted
  // MAX_CHART_VAL to module level so it isn't recomputed each render
  const anim = useRef(CHART_DATA.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(80,
      anim.map(a =>
        Animated.timing(a, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false })
      )
    ).start();
  }, []);

  const chartW   = SW - 44 - 40;
  const chartH   = 140;
  const barWidth = (chartW - 10) / CHART_DATA.length - 8;

  return (
    <View style={{ height: chartH + 40, paddingTop: 8 }}>
      <Svg width={chartW} height={chartH} style={{ position: 'absolute', top: 8, left: 0 }}>
        <Defs>
          <SvgGrad id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%"   stopColor={C.maroon}     stopOpacity="1" />
            <Stop offset="100%" stopColor={C.maroonLight} stopOpacity="0.8" />
          </SvgGrad>
        </Defs>
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <G key={i}>
            <Line
              x1={0} y1={chartH - chartH * p}
              x2={chartW} y2={chartH - chartH * p}
              stroke="rgba(107,15,26,0.06)" strokeWidth="1"
            />
            <SvgText
              x={-2} y={chartH - chartH * p + 4}
              fontSize="7" fill={C.gray} textAnchor="end"
            >
              {Math.round(MAX_CHART_VAL * p)}
            </SvgText>
          </G>
        ))}
      </Svg>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartH, gap: 8, paddingLeft: 16 }}>
        {CHART_DATA.map((d, i) => {
          const barH = anim[i].interpolate({
            inputRange:  [0, 1],
            outputRange: [0, (d.value / MAX_CHART_VAL) * chartH],
          });
          return (
            <View key={i} style={{ alignItems: 'center', width: barWidth }}>
              <Text style={styles.chartValue}>{d.value}</Text>
              <Animated.View style={{ width: barWidth, height: barH, borderRadius: 5, overflow: 'hidden' }}>
                <LinearGradient
                  colors={[C.maroon, C.maroonLight]}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={{ flex: 1 }}
                />
              </Animated.View>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingLeft: 16, marginTop: 6 }}>
        {CHART_DATA.map((d, i) => (
          <Text key={i} style={[styles.chartLabel, { width: barWidth }]}>
            {d.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

// ─── Paths Modal ──────────────────────────────────────────────────────────────
const PathsModal = ({ visible, onClose }) => {
  const [search,       setSearch]       = useState('');
  const [sortAsc,      setSortAsc]      = useState(false);
  const [monthDropOpen,setMonthDropOpen]= useState(false);
  const [selectedMonth,setSelectedMonth]= useState(AVAILABLE_MONTHS[0]);

  const filtered = useMemo(() => {
    let data = [...ALL_PATHS_DATA];

    if (selectedMonth.month !== null) {
      data = data.filter(d => d.month === selectedMonth.month && d.year === selectedMonth.year);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(d =>
        d.from.toLowerCase().includes(q) || d.to.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => sortAsc ? a.value - b.value : b.value - a.value);
    return data;
  }, [search, sortAsc, selectedMonth]);

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.modalOverlay}>
        {/* FIX: Backdrop closes dropdown without blocking list touches */}
        {monthDropOpen && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setMonthDropOpen(false)}
            activeOpacity={1}
          />
        )}
        <View style={styles.modalSheet}>

          <LinearGradient
            colors={[C.maroonDark, C.maroon]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <View>
              <Text style={styles.modalHeaderTitle}>All Frequent Paths</Text>
              <Text style={styles.modalHeaderSub}>
                {filtered.length} route{filtered.length !== 1 ? 's' : ''} found
              </Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.8}>
              <IconClose size={18} color={C.white} />
            </TouchableOpacity>
          </LinearGradient>
          <View style={{ height: 3, backgroundColor: C.gold, opacity: 0.5 }} />

          {/* Controls */}
          <View style={styles.modalControls}>
            <View style={styles.searchBar}>
              <IconSearch size={15} color={C.gray} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search nodes or routes…"
                placeholderTextColor={C.gray}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                  <Text style={{ fontSize: 16, color: C.gray, lineHeight: 18 }}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.controlRow}>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setSortAsc(p => !p)}
                activeOpacity={0.75}
              >
                <IconSort size={14} color={C.maroon} asc={sortAsc} />
                <Text style={styles.sortBtnText}>{sortAsc ? 'Asc' : 'Desc'}</Text>
              </TouchableOpacity>

              <View style={{ flex: 1, position: 'relative' }}>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setMonthDropOpen(p => !p)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownTriggerText} numberOfLines={1}>
                    {selectedMonth.label}
                  </Text>
                  <IconChevronDown size={13} color={C.maroon} />
                </TouchableOpacity>

                {monthDropOpen && (
                  <View style={styles.dropdownMenu}>
                    {AVAILABLE_MONTHS.map((m, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.dropdownItem,
                          selectedMonth.label === m.label && styles.dropdownItemActive,
                          i === AVAILABLE_MONTHS.length - 1 && { borderBottomWidth: 0 },
                        ]}
                        onPress={() => { setSelectedMonth(m); setMonthDropOpen(false); }}
                        activeOpacity={0.75}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          selectedMonth.label === m.label && styles.dropdownItemTextActive,
                        ]}>
                          {m.label}
                        </Text>
                        {selectedMonth.label === m.label && (
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.maroon }} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, paddingTop: 4 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 13, color: C.gray }}>
                  No paths found
                </Text>
                <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 11.5, color: C.grayLight, marginTop: 4 }}>
                  Try adjusting your filters
                </Text>
              </View>
            )}
            renderItem={({ item, index }) => {
              const rank = index + 1;
              const rc   = rankColor(rank);
              const rb   = rankBg(rank);
              return (
                <View style={styles.pathItem}>
                  <View style={[styles.pathRankBadge, { backgroundColor: rb, borderColor: rc + '40' }]}>
                    <Text style={[styles.pathRankNum, { color: rc }]}>#{rank}</Text>
                  </View>
                  <View style={styles.pathInfo}>
                    <Text style={styles.pathRoute} numberOfLines={1}>{item.from}</Text>
                    <View style={styles.pathArrow}>
                      <View style={{ flex: 1, height: 1, backgroundColor: C.grayLight }} />
                      <Text style={styles.pathArrowText}>→</Text>
                      <View style={{ flex: 1, height: 1, backgroundColor: C.grayLight }} />
                    </View>
                    <Text style={styles.pathRoute} numberOfLines={1}>{item.to}</Text>
                  </View>
                  <View style={styles.pathCount}>
                    <Text style={styles.pathCountNum}>{item.value}</Text>
                    <Text style={styles.pathCountLabel}>uses</Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

// ─── History Modal ────────────────────────────────────────────────────────────
const HistoryModal = ({ visible, onClose }) => {
  const [adminDropOpen, setAdminDropOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState('All Admins');

  const filtered = useMemo(() => {
    if (selectedAdmin === 'All Admins') return HISTORY;
    return HISTORY.filter(h => h.user === selectedAdmin);
  }, [selectedAdmin]);

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.modalOverlay}>
        {/* FIX: Backdrop moved outside modalSheet so it doesn't block list touches */}
        {adminDropOpen && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setAdminDropOpen(false)}
            activeOpacity={1}
          />
        )}
        <View style={styles.modalSheet}>

          <LinearGradient
            colors={[C.maroonDark, C.maroon]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <View>
              <Text style={styles.modalHeaderTitle}>History of Changes</Text>
              <Text style={styles.modalHeaderSub}>
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose} activeOpacity={0.8}>
              <IconClose size={18} color={C.white} />
            </TouchableOpacity>
          </LinearGradient>
          <View style={{ height: 3, backgroundColor: C.gold, opacity: 0.5 }} />

          <View style={styles.modalControls}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.filterLabel}>Filter by admin:</Text>
              <View style={{ flex: 1, position: 'relative' }}>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setAdminDropOpen(p => !p)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownTriggerText}>@{selectedAdmin}</Text>
                  <IconChevronDown size={13} color={C.maroon} />
                </TouchableOpacity>

                {adminDropOpen && (
                  <View style={[styles.dropdownMenu, { zIndex: 100 }]}>
                    {ADMIN_USERS.map((u, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.dropdownItem,
                          selectedAdmin === u && styles.dropdownItemActive,
                          i === ADMIN_USERS.length - 1 && { borderBottomWidth: 0 },
                        ]}
                        onPress={() => { setSelectedAdmin(u); setAdminDropOpen(false); }}
                        activeOpacity={0.75}
                      >
                        <Text style={[
                          styles.dropdownItemText,
                          selectedAdmin === u && styles.dropdownItemTextActive,
                        ]}>
                          {u === 'All Admins' ? u : `@${u}`}
                        </Text>
                        {selectedAdmin === u && (
                          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.maroon }} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* FIX: Uses shared HistoryRow component — no duplicate JSX */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30, paddingTop: 4 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 13, color: C.gray }}>
                  No records found
                </Text>
                <Text style={{ fontFamily: 'Montserrat_400Regular', fontSize: 11.5, color: C.grayLight, marginTop: 4 }}>
                  No changes by this admin
                </Text>
              </View>
            )}
            renderItem={({ item, index }) => (
              <HistoryRow item={item} isLast={index === filtered.length - 1} />
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

// ─── Animated counter helper ──────────────────────────────────────────────────
// FIX: Added `anim` to useEffect dependency array to prevent stale closure / memory leak
function AnimatedCounter({ anim, style, color }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value }) => setDisplay(Math.round(value)));
    return () => anim.removeListener(id);
  }, [anim]);
  return (
    <Text style={[style, { color }]}>
      {display.toLocaleString()}
    </Text>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function App() {

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  const [menuOpen,         setMenuOpen]         = useState(false);
  const [activeMenu,       setActiveMenu]       = useState('dashboard');
  const [pathsModalOpen,   setPathsModalOpen]   = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const headerOp  = useRef(new Animated.Value(0)).current;
  const headerY   = useRef(new Animated.Value(-20)).current;
  const contentOp = useRef(new Animated.Value(0)).current;
  const contentY  = useRef(new Animated.Value(24)).current;
  const menuSlide = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const menuBgOp  = useRef(new Animated.Value(0)).current;
  const statAnims = useRef([0, 0, 0].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOp, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.timing(headerY,  { toValue: 0, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(160),
        Animated.parallel([
          Animated.timing(contentOp, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(contentY,  { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]),
    ]).start();

    Animated.stagger(100,
      statAnims.map(a =>
        Animated.timing(a, { toValue: 1, duration: 1000, easing: Easing.out(Easing.cubic), useNativeDriver: false })
      )
    ).start();
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.timing(menuSlide, { toValue: 0,          duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(menuBgOp,  { toValue: 1,          duration: 280, useNativeDriver: true }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(menuSlide, { toValue: -MENU_WIDTH, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(menuBgOp,  { toValue: 0,           duration: 240, useNativeDriver: true }),
    ]).start(() => setMenuOpen(false));
  };

  const handleMenuPress = (id) => {
    setActiveMenu(id);
    closeMenu();
  };

  const nodeCount = statAnims[0].interpolate({ inputRange: [0, 1], outputRange: [0, STATS.nodes] });
  const edgeCount = statAnims[1].interpolate({ inputRange: [0, 1], outputRange: [0, STATS.edges] });
  const userCount = statAnims[2].interpolate({ inputRange: [0, 1], outputRange: [0, STATS.users] });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.maroonDark} />

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.header, { opacity: headerOp, transform: [{ translateY: headerY }] }]}>
        <LinearGradient
          colors={[C.maroonDark, C.maroon]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerLeft}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>O</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Admin Dashboard</Text>
              <Text style={styles.headerSub}>O See · Campus Navigator</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.menuBtn} onPress={openMenu} activeOpacity={0.75}>
            <IconMenu size={20} color={C.white} />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.headerAccent} />
      </Animated.View>

      {/* ── SCROLLABLE CONTENT ──────────────────────────────────────────────── */}
      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: C.grayFaint }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: contentOp, transform: [{ translateY: contentY }] }}>

          {/* ── WELCOME STRIP ─────────────────────────────────────────────── */}
          <View style={styles.welcomeStrip}>
            <View>
              <Text style={styles.welcomeTitle}>Good day, Admin 👋</Text>
              <Text style={styles.welcomeSub}>Here's what's happening on campus.</Text>
            </View>
            {/* FIX: Uses module-level TODAY_LABEL instead of new Date() on every render */}
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>{TODAY_LABEL}</Text>
            </View>
          </View>

          {/* ── STAT CARDS ────────────────────────────────────────────────── */}
          <View style={styles.statsGrid}>

            <View style={[styles.statCard, { borderTopColor: C.maroon }]}>
              <View style={[styles.statIconWrap, { backgroundColor: C.maroonFaint }]}>
                <IconNode size={18} color={C.maroon} />
              </View>
              <AnimatedCounter anim={nodeCount} style={styles.statNum} color={C.maroon} />
              <Text style={styles.statLabel}>Total Nodes</Text>
            </View>

            <View style={[styles.statCard, { borderTopColor: C.blue }]}>
              <View style={[styles.statIconWrap, { backgroundColor: C.blueFaint }]}>
                <IconEdge size={18} color={C.blue} />
              </View>
              <AnimatedCounter anim={edgeCount} style={styles.statNum} color={C.blue} />
              <Text style={styles.statLabel}>Total Edges</Text>
            </View>

            <View style={[styles.statCard, { borderTopColor: C.green }]}>
              <View style={[styles.statIconWrap, { backgroundColor: C.greenFaint }]}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="9" cy="7" r="4" stroke={C.green} strokeWidth="1.7" />
                  <Path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke={C.green} strokeWidth="1.7" strokeLinecap="round" />
                  <Path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke={C.green} strokeWidth="1.7" strokeLinecap="round" />
                </Svg>
              </View>
              <AnimatedCounter anim={userCount} style={styles.statNum} color={C.green} />
              <Text style={styles.statLabel}>App Users</Text>
            </View>

          </View>

          {/* ── COLUMN CHART ──────────────────────────────────────────────── */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Most Frequent Paths</Text>
              <View style={styles.sectionLine} />
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => setPathsModalOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.sectionSubRow}>
              <Text style={styles.sectionSubtitle}>Commonly used routes by app users</Text>
              <View style={styles.sectionSubActions}>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>Top 6</Text>
                </View>
              </View>
            </View>
            <ColumnChart />
          </View>

          {/* ── HISTORY CHANGES ───────────────────────────────────────────── */}
          <View style={[styles.sectionCard, { marginBottom: 24 }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: C.blue }]} />
              <Text style={styles.sectionTitle}>History of Changes</Text>
              <View style={styles.sectionLine} />
              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => setHistoryModalOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>Recent modifications to map data</Text>

            {/* FIX: Uses shared HistoryRow — no duplicate render logic */}
            <View style={styles.historyList}>
              {HISTORY_PREVIEW.map((item, index) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  isLast={index === HISTORY_PREVIEW.length - 1}
                />
              ))}
            </View>

            {HISTORY.length > 5 && (
              <TouchableOpacity
                style={styles.showMoreHint}
                onPress={() => setHistoryModalOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.showMoreHintText}>
                  Showing 5 of {HISTORY.length} — tap View All to see more
                </Text>
              </TouchableOpacity>
            )}
          </View>

        </Animated.View>
      </Animated.ScrollView>

      {/* ── SLIDE-OUT MENU ──────────────────────────────────────────────────── */}
      {menuOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.menuOverlay, { opacity: menuBgOp }]}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeMenu} activeOpacity={1} />
          </Animated.View>

          <Animated.View style={[styles.menuPanel, { transform: [{ translateX: menuSlide }] }]}>
            <LinearGradient colors={[C.maroonDark, '#2a0008']} style={styles.menuGradient}>

              <View style={styles.menuHeader}>
                <View style={styles.menuLogoWrap}>
                  <View style={styles.menuLogo}>
                    <Text style={styles.menuLogoText}>O</Text>
                  </View>
                  <View>
                    <Text style={styles.menuAppName}>O SEE</Text>
                    <Text style={styles.menuAppSub}>Admin Panel</Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuDivider} />

              <View style={styles.menuAdminInfo}>
                <View style={styles.menuAvatar}>
                  <Text style={styles.menuAvatarText}>A</Text>
                </View>
                <View>
                  <Text style={styles.menuAdminName}>Administrator</Text>
                  <Text style={styles.menuAdminRole}>Super Admin · Osmena Colleges</Text>
                </View>
              </View>

              <View style={styles.menuSectionLabel}>
                <Text style={styles.menuSectionLabelText}>NAVIGATION</Text>
              </View>

              <View style={styles.menuItems}>
                {MENU_ITEMS.map((item) => {
                  const isActive  = activeMenu === item.id;
                  const isLogout  = item.id === 'logout';
                  const isBack    = item.id === 'backtoapp';
                  const iconColor = isLogout ? '#EF4444' : isActive ? C.gold : 'rgba(250,247,242,0.65)';
                  const textColor = isLogout ? '#EF4444' : isActive ? C.gold : 'rgba(250,247,242,0.8)';

                  return (
                    <React.Fragment key={item.id}>
                      {isBack && <View style={styles.menuItemSeparator} />}
                      <TouchableOpacity
                        style={[styles.menuItem, isActive && styles.menuItemActive]}
                        onPress={() => handleMenuPress(item.id)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.menuItemLabel, { color: textColor }]}>{item.label}</Text>
                        {isActive && <View style={styles.menuItemActiveDot} />}
                      </TouchableOpacity>
                    </React.Fragment>
                  );
                })}
              </View>

              <View style={styles.menuFooter}>
                <Text style={styles.menuFooterText}>O See · v1.0.0</Text>
              </View>

            </LinearGradient>
          </Animated.View>
        </View>
      )}

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}
      <PathsModal  visible={pathsModalOpen}   onClose={() => setPathsModalOpen(false)}  />
      <HistoryModal visible={historyModalOpen} onClose={() => setHistoryModalOpen(false)} />

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: C.grayFaint,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    shadowColor:   C.maroonDark,
    shadowOpacity: 0.25,
    shadowRadius:  10,
    shadowOffset:  { width: 0, height: 4 },
    elevation:     8,
    zIndex:        10,
  },
  headerGradient: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingTop:        Platform.OS === 'ios' ? 54 : 44,
    paddingBottom:     14,
    paddingHorizontal: 18,
  },
  headerAccent: {
    height:          3,
    backgroundColor: C.gold,
    opacity:         0.6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  logoMark: {
    width:           38,
    height:          38,
    borderRadius:    19,
    borderWidth:     1.5,
    borderColor:     C.gold,
    backgroundColor: 'rgba(201,169,110,0.1)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  logoText: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize:   24,
    color:      C.gold,
    lineHeight: 28,
  },
  headerTitle: {
    fontFamily:    'CormorantGaramond_700Bold',
    fontSize:      24,
    color:         C.white,
    letterSpacing: 0.3,
    lineHeight:    23,
  },
  headerSub: {
    fontFamily:     'Montserrat_400Regular',
    fontSize:       9,
    color:          'rgba(201,169,110,0.8)',
    letterSpacing:  1.5,
    textTransform:  'uppercase',
  },
  menuBtn: {
    width:           42,
    height:          42,
    borderRadius:    21,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Scroll content ────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop:        18,
    paddingBottom:     30,
  },

  // ── Welcome strip ─────────────────────────────────────────────────────────
  welcomeStrip: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   16,
  },
  welcomeTitle: {
    fontFamily:    'CormorantGaramond_700Bold',
    fontSize:      26,
    color:         C.maroon,
    letterSpacing: 0.3,
    lineHeight:    27,
  },
  welcomeSub: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      12,
    color:         C.grayMid,
    letterSpacing: 0.2,
    marginTop:     2,
  },
  dateBadge: {
    backgroundColor: C.maroonFaint,
    borderWidth:     1,
    borderColor:     'rgba(107,15,26,0.15)',
    borderRadius:    8,
    paddingHorizontal: 10,
    paddingVertical:   5,
  },
  dateBadgeText: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      9.5,
    color:         C.maroon,
    letterSpacing: 0.3,
  },

  // ── Stat cards ────────────────────────────────────────────────────────────
  statsGrid: {
    flexDirection: 'row',
    gap:           10,
    marginBottom:  14,
  },
  statCard: {
    flex:            1,
    backgroundColor: C.white,
    borderRadius:    14,
    padding:         14,
    borderTopWidth:  3,
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOpacity:   0.06,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       3,
    gap:             6,
  },
  statIconWrap: {
    width:          36,
    height:         36,
    borderRadius:   18,
    alignItems:     'center',
    justifyContent: 'center',
  },
  statNum: {
    fontFamily:    'Montserrat_700Bold',
    fontSize:      22,
    letterSpacing: -0.5,
    lineHeight:    26,
  },
  statLabel: {
    fontFamily:    'Montserrat_700Bold',
    fontSize:      9.5,
    color:         C.grayMid,
    letterSpacing: 0.3,
    textAlign:     'center',
  },

  // ── Section card ──────────────────────────────────────────────────────────
  sectionCard: {
    backgroundColor: C.white,
    borderRadius:    16,
    padding:         16,
    marginBottom:    14,
    shadowColor:     '#000',
    shadowOpacity:   0.06,
    shadowRadius:    10,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginBottom:  3,
  },
  sectionDot: {
    width:        7,
    height:       7,
    borderRadius: 3.5,
    backgroundColor: C.gold,
  },
  sectionTitle: {
    fontFamily:    'Montserrat_700Bold',
    fontSize:      12,
    color:         C.maroon,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionLine: {
    flex:            1,
    height:          1,
    backgroundColor: C.grayLight,
  },
  sectionBadge: {
    borderRadius:    6,
    paddingHorizontal: 7,
    paddingVertical:   2,
  },
  sectionBadgeText: {
    fontFamily:    'Montserrat_700Bold',
    fontSize:      8.5,
    color:         C.maroon,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      11.5,
    color:         C.charcoal,
    letterSpacing: 0.2,
    flexShrink:    1,
  },
  sectionSubRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    gap:            8,
    marginBottom:   15,
  },
  sectionSubActions: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
    flexShrink:    0,
  },
  viewAllBtn: {
    backgroundColor: C.maroon,
    borderRadius:    6,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  viewAllText: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      8.5,
    color:         C.white,
    letterSpacing: 0.5,
  },

  // ── Chart ─────────────────────────────────────────────────────────────────
  chartValue: {
    fontFamily: 'Montserrat_700Bold',
    fontSize:   9,
    color:      C.maroon,
    textAlign:  'center',
    marginBottom: 3,
  },
  chartLabel: {
    fontFamily: 'Montserrat_400Regular',
    fontSize:   7.5,
    color:      C.black,
    textAlign:  'center',
    lineHeight: 10,
  },

  // ── History ───────────────────────────────────────────────────────────────
  historyList: {
    marginTop: 4,
  },
  historyItem: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.grayFaint,
  },
  historyBadge: {
    width:          40,
    paddingVertical: 3,
    borderRadius:   6,
    alignItems:     'center',
    flexShrink:     0,
  },
  historyBadgeText: {
    fontFamily:    'Montserrat_700Bold',
    fontSize:      7.5,
    letterSpacing: 0.5,
  },
  historyContent: {
    flex: 1,
    gap:  1,
  },
  historyAction: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      13,
    color:         C.black,
    letterSpacing: 0.2,
  },
  historyDetail: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      11.5,
    color:         C.charcoal,
    letterSpacing: 0.2,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
    marginTop:     2,
  },
  historyUser: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      10.5,
    color:         C.maroon,
    letterSpacing: 0.3,
  },
  historyDot: {
    color:    C.gray,
    fontSize: 9,
  },
  historyTime: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      10.5,
    color:         C.grayMid,
    letterSpacing: 0.2,
  },
  historyDotRight: {
    width:        7,
    height:       7,
    borderRadius: 3.5,
    flexShrink:   0,
  },
  showMoreHint: {
    marginTop:       10,
    alignItems:      'center',
    paddingVertical: 6,
    borderTopWidth:  1,
    borderTopColor:  C.grayFaint,
  },
  showMoreHintText: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      10.5,
    color:         C.maroon,
    letterSpacing: 0.3,
  },

  // ── Menu overlay ──────────────────────────────────────────────────────────
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex:          20,
  },
  menuPanel: {
    position:     'absolute',
    left:         0,
    top:          0,
    bottom:       0,
    width:        MENU_WIDTH,
    zIndex:       30,
    shadowColor:  '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 6, height: 0 },
    elevation:    20,
  },
  menuGradient: {
    flex:       1,
    paddingTop: Platform.OS === 'ios' ? 56 : 46,
  },
  menuHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingBottom:     16,
  },
  menuLogoWrap: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  menuLogo: {
    width:           40,
    height:          40,
    borderRadius:    20,
    borderWidth:     1.5,
    borderColor:     C.gold,
    backgroundColor: 'rgba(201,169,110,0.1)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuLogoText: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize:   26,
    color:      C.gold,
    lineHeight: 30,
  },
  menuAppName: {
    fontFamily:    'Montserrat_700Bold',
    fontSize:      15,
    color:         C.white,
    letterSpacing: 4,
  },
  menuAppSub: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      9,
    color:         'rgba(201,169,110,0.7)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  menuCloseBtn: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuDivider: {
    height:            1,
    backgroundColor:   C.gold,
    opacity:           0.25,
    marginHorizontal:  20,
    marginBottom:      16,
  },
  menuAdminInfo: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               12,
    paddingHorizontal: 15,
    paddingVertical:   12,
    backgroundColor:   'rgba(255,255,255,0.05)',
    marginHorizontal:  16,
    borderRadius:      12,
    marginBottom:      20,
    borderWidth:       1,
    borderColor:       'rgba(201,169,110,0.15)',
  },
  menuAvatar: {
    width:           38,
    height:          38,
    borderRadius:    19,
    backgroundColor: C.maroonLight,
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuAvatarText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize:   16,
    color:      C.white,
  },
  menuAdminName: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      12.5,
    color:         C.white,
    letterSpacing: 0.2,
  },
  menuAdminRole: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      9,
    color:         'rgba(201,169,110,0.65)',
    letterSpacing: 0.5,
    marginTop:     1,
  },
  menuSectionLabel: {
    paddingHorizontal: 20,
    marginBottom:      6,
  },
  menuSectionLabelText: {
    fontFamily:    'Montserrat_700Bold',
    fontSize:      8,
    color:         'rgba(250,247,242,0.5)',
    letterSpacing: 2.5,
  },
  menuItems: {
    paddingHorizontal: 12,
    flex:              1,
  },
  menuItem: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               12,
    paddingVertical:   13,
    paddingHorizontal: 12,
    marginBottom:      2,
  },
  menuItemActive: {
    borderBottomWidth:     1,
    borderColor:     'rgba(201,169,110,0.5)',
  },
  menuItemLabel: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      15,
    letterSpacing: 0.3,
    flex:          1,
  },
  menuItemActiveDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
    backgroundColor: C.gold,
  },
  menuItemSeparator: {
    height:           1,
    backgroundColor:  'rgba(255,255,255,0.07)',
    marginVertical:   8,
    marginHorizontal: 12,
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingBottom:     Platform.OS === 'ios' ? 36 : 22,
    paddingTop:        12,
    borderTopWidth:    1,
    borderTopColor:    'rgba(255,255,255,0.07)',
    alignItems:        'center',
  },
  menuFooterText: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      9,
    color:         'rgba(250,247,242,0.2)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // ── Modal shared ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'flex-end',
  },
  modalSheet: {
    backgroundColor:    C.grayFaint,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    maxHeight:          SH * 0.92,
    overflow:           'hidden',
    flex:               1,
    marginTop:          SH * 0.08,
  },
  modalHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingTop:        20,
    paddingBottom:     16,
  },
  modalHeaderTitle: {
    fontFamily:    'CormorantGaramond_700Bold',
    fontSize:      22,
    color:         C.white,
    letterSpacing: 0.3,
  },
  modalHeaderSub: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      10,
    color:         'rgba(201,169,110,0.8)',
    letterSpacing: 0.5,
    marginTop:     2,
  },
  modalCloseBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
  },

  // ── Modal controls ────────────────────────────────────────────────────────
  modalControls: {
    backgroundColor:  C.white,
    paddingHorizontal: 16,
    paddingVertical:   14,
    gap:              10,
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
  },
  searchBar: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               8,
    backgroundColor:   C.grayFaint,
    borderRadius:      10,
    borderWidth:       1,
    borderColor:       C.grayLight,
    paddingHorizontal: 12,
    paddingVertical:   9,
  },
  searchInput: {
    flex:       1,
    fontFamily: 'Montserrat_400Regular',
    fontSize:   13,
    color:      C.black,
    padding:    0,
    margin:     0,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  sortBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               5,
    backgroundColor:   C.maroonFaint,
    borderWidth:       1,
    borderColor:       'rgba(107,15,26,0.18)',
    borderRadius:      8,
    paddingHorizontal: 12,
    paddingVertical:   8,
  },
  sortBtnText: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      11,
    color:         C.maroon,
    letterSpacing: 0.3,
  },
  dropdownTrigger: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   C.grayFaint,
    borderWidth:       1,
    borderColor:       C.grayLight,
    borderRadius:      8,
    paddingHorizontal: 12,
    paddingVertical:   8,
  },
  dropdownTriggerText: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      11,
    color:         C.maroon,
    letterSpacing: 0.3,
    flex:          1,
  },
  dropdownMenu: {
    position:      'absolute',
    top:           40,
    left:          0,
    right:         0,
    backgroundColor: C.white,
    borderRadius:  10,
    borderWidth:   1,
    borderColor:   C.grayLight,
    shadowColor:   '#000',
    shadowOpacity: 0.12,
    shadowRadius:  10,
    shadowOffset:  { width: 0, height: 4 },
    elevation:     10,
    zIndex:        999,
    overflow:      'hidden',
  },
  dropdownItem: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 14,
    paddingVertical:   11,
    borderBottomWidth: 1,
    borderBottomColor: C.grayFaint,
  },
  dropdownItemActive: {
    backgroundColor: C.maroonFaint,
  },
  dropdownItemText: {
    fontFamily: 'Montserrat_400Regular',
    fontSize:   12,
    color:      C.charcoal,
  },
  dropdownItemTextActive: {
    fontFamily: 'Montserrat_600SemiBold',
    color:      C.maroon,
  },
  filterLabel: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      11.5,
    color:         C.charcoal,
    letterSpacing: 0.2,
    flexShrink:    0,
  },

  // ── Path list item ────────────────────────────────────────────────────────
  pathItem: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.white,
    borderRadius:    12,
    padding:         12,
    marginTop:       8,
    gap:             10,
    shadowColor:     '#000',
    shadowOpacity:   0.04,
    shadowRadius:    6,
    shadowOffset:    { width: 0, height: 2 },
    elevation:       2,
  },
  pathRankBadge: {
    width:          38,
    height:         38,
    borderRadius:   10,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    1,
    flexShrink:     0,
  },
  pathRankNum: {
    fontFamily:    'Montserrat_700Bold',
    fontSize:      12,
    letterSpacing: 0.3,
  },
  pathInfo: {
    flex: 1,
    gap:  2,
  },
  pathRoute: {
    fontFamily:    'Montserrat_600SemiBold',
    fontSize:      12,
    color:         C.black,
    letterSpacing: 0.2,
  },
  pathArrow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           4,
  },
  pathArrowText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize:   10,
    color:      C.maroon,
  },
  pathCount: {
    alignItems: 'center',
    flexShrink: 0,
  },
  pathCountNum: {
    fontFamily:    'Montserrat_700Bold',
    fontSize:      18,
    color:         C.maroon,
    letterSpacing: -0.5,
    lineHeight:    20,
  },
  pathCountLabel: {
    fontFamily:    'Montserrat_400Regular',
    fontSize:      9,
    color:         C.gray,
    letterSpacing: 0.3,
  },
});