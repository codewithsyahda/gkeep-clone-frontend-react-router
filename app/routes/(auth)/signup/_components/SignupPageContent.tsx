import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import Link from '~/components/custom-mui/Link';
import InputPassword from '~/components/InputPassword';
import Spinner from '~/components/Spinner';
import AppBrandLogo from '~/routes/_components/AppBrandLogo';
import AuthPageContainer from '../../_components/AuthPageContainer';

import useSession from '~/hooks/react-query/auth/useSession';
import useSignupWithEmail from '~/hooks/react-query/auth/useSignupWithEmail';
import { SignupFormScheme } from '~/lib/definitions';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';

export default function SignupPageContent() {
  const rhf = useForm<z.infer<typeof SignupFormScheme>>({
    resolver: zodResolver(SignupFormScheme),
    defaultValues: {
      fullname: '',
      email: '',
      password: '',
    },
  });

  const navigate = useNavigate();

  const mutSignupWithEmail = useSignupWithEmail();

  const handleSignup = async (data: z.infer<typeof SignupFormScheme>) => {
    try {
      await mutSignupWithEmail.mutateAsync({
        name: data.fullname,
        email: data.email,
        password: data.password,
      });

      await navigate('/signin');

      emitSnackbarAlert({
        alertText: 'Signing up is successful',
      });
    } catch (error) {
      const errorMessage = (error as Error).message;

      emitSnackbarAlert({
        alertText: errorMessage,
        alertSeverity: 'error',
      });
    }
  };

  const session = useSession();

  const sessionData = session.data?.session;

  useEffect(() => {
    if (!session.isPending && sessionData) {
      const redirect = async () => {
        const firstName = sessionData.name.split(' ')[0];

        await navigate('/', { replace: true });

        emitSnackbarAlert({
          alertText: `Welcome back, ${firstName}!`,
        });
      };

      void redirect();
    }
  }, [navigate, session.isPending, sessionData]);

  if (!mutSignupWithEmail.isSuccess && (session.isPending || sessionData)) {
    return null;
  }

  return (
    <AuthPageContainer>
      <AppBrandLogo />
      <Card>
        <CardContent>
          <Stack spacing={4}>
            <Stack
              spacing={1}
              sx={{
                textAlign: 'center',
                textWrap: 'balance',
              }}
            >
              <Typography
                component="h1"
                sx={{
                  typography: {
                    xs: 'h5',
                  },
                }}
              >
                Create your account
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                Enter your email below to create your account
              </Typography>
            </Stack>
            <Box
              id="sign-up-form"
              component="form"
              onSubmit={rhf.handleSubmit(handleSignup)}
            >
              <Stack spacing={4}>
                <Controller
                  control={rhf.control}
                  name="fullname"
                  render={({
                    field: { disabled, ref, ...restFields },
                    fieldState,
                  }) => (
                    <TextField
                      {...restFields}
                      label="Fullname"
                      type="text"
                      inputRef={ref}
                      disabled={
                        disabled ||
                        mutSignupWithEmail.isPending ||
                        mutSignupWithEmail.isSuccess
                      }
                      error={fieldState.invalid}
                      helperText={
                        fieldState.invalid && fieldState.error
                          ? fieldState.error.message
                          : ''
                      }
                      fullWidth
                    />
                  )}
                />
                <Controller
                  control={rhf.control}
                  name="email"
                  render={({
                    field: { disabled, ref, ...restFields },
                    fieldState,
                  }) => (
                    <TextField
                      {...restFields}
                      label="Email"
                      type="email"
                      inputRef={ref}
                      disabled={
                        disabled ||
                        mutSignupWithEmail.isPending ||
                        mutSignupWithEmail.isSuccess
                      }
                      error={fieldState.invalid}
                      helperText={
                        fieldState.invalid && fieldState.error
                          ? fieldState.error.message
                          : ''
                      }
                      fullWidth
                    />
                  )}
                />
                <Controller
                  control={rhf.control}
                  name="password"
                  render={({
                    field: { disabled, ref, ...restFields },
                    fieldState,
                  }) => (
                    <InputPassword
                      {...restFields}
                      label="Password"
                      inputRef={ref}
                      disabled={
                        disabled ||
                        mutSignupWithEmail.isPending ||
                        mutSignupWithEmail.isSuccess
                      }
                      error={fieldState.invalid}
                      helperText={
                        fieldState.invalid && fieldState.error
                          ? fieldState.error.message
                          : ''
                      }
                      fullWidth
                    />
                  )}
                />
              </Stack>
            </Box>
          </Stack>
        </CardContent>
        <CardActions>
          <Stack
            spacing={2}
            sx={{
              px: 1,
              py: 1,
              width: '100%',
            }}
          >
            <Button
              form="sign-up-form"
              type="submit"
              variant="contained"
              disabled={
                mutSignupWithEmail.isPending || mutSignupWithEmail.isSuccess
              }
              fullWidth
            >
              {mutSignupWithEmail.isPending && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Spinner size={24} /> <span>Creating</span>
                </Stack>
              )}
              {!mutSignupWithEmail.isPending &&
                !mutSignupWithEmail.isSuccess &&
                'Create account'}
              {mutSignupWithEmail.isSuccess && 'Created'}
            </Button>
            <Typography
              sx={{
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              Already have an account? <Link to="/signin">Sign in</Link>
            </Typography>
          </Stack>
        </CardActions>
      </Card>
    </AuthPageContainer>
  );
}
