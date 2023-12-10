import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

export const MyButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText('#530031'),
  backgroundColor: '#530031',
  '&:hover': {
    backgroundColor: '#732051',
  },
}));