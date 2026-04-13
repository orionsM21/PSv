import {StyleSheet} from 'react-native';

export const modalStyles = StyleSheet.create({
  sheet: {
    margin: 0,
    justifyContent: 'flex-end',
  },

  wrapper: {
    backgroundColor: '#F8FBFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    maxHeight: '92%',
    shadowColor: '#04142E',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: -6},
    elevation: 12,
  },

  handle: {
    alignSelf: 'center',
    width: 52,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#CBD5E1',
    marginBottom: 14,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  titleWrap: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },

  subtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },

  clearButton: {
    backgroundColor: '#0B2D6C',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#DCE8FB',
    marginBottom: 14,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  buttonPrimary: {
    flex: 1,
    backgroundColor: '#0B2D6C',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginLeft: 6,
  },

  buttonSecondary: {
    flex: 1,
    backgroundColor: '#E7ECF3',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 6,
  },

  buttonTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  buttonTextSecondary: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },

  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE8FB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },

  radioRowActive: {
    backgroundColor: '#F4F8FF',
    borderColor: '#0B2D6C',
  },

  radioLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
    color: '#0F172A',
  },
});
