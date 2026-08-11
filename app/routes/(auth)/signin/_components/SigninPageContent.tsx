import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
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

import { SigninFormScheme } from '~/lib/definitions';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';

const useSession = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/auth/__mocks__/useSession')
    : import('~/hooks/react-query/auth/useSession'))
).default;

const useSigninWithEmail = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/auth/__mocks__/useSigninWithEmail')
    : import('~/hooks/react-query/auth/useSigninWithEmail'))
).default;

export default function SigninPageContent() {
  const rhf = useForm<z.infer<typeof SigninFormScheme>>({
    resolver: zodResolver(SigninFormScheme),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const queryClient = useQueryClient();
  const mutSigninWithEmail = useSigninWithEmail();

  const handleSignin = async (data: z.infer<typeof SigninFormScheme>) => {
    try {
      await mutSigninWithEmail.mutateAsync(data);

      queryClient.removeQueries({
        queryKey: ['session'],
      });
    } catch (err) {
      const errMessage = (err as Error).message;

      emitSnackbarAlert({
        alertText: errMessage,
        alertSeverity: 'error',
      });
    }
  };

  const navigate = useNavigate();
  const session = useSession();

  const sessionData = session.data;

  useEffect(() => {
    if (!session.isPending && sessionData) {
      const firstName = sessionData.session.name.split(' ')[0];

      emitSnackbarAlert({
        alertText: `Welcome back, ${firstName}!`,
      });

      navigate('/', { replace: true });
    }
  }, [navigate, session.isPending, sessionData]);

  if (!mutSigninWithEmail.isSuccess && (session.isPending || sessionData)) {
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
                Welcome back
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                }}
              >
                Enter your email below to sign in to your account
              </Typography>
            </Stack>
            <Box
              id="sign-in-form"
              component="form"
              onSubmit={rhf.handleSubmit(handleSignin)}
            >
              <Stack spacing={4}>
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
                        mutSigninWithEmail.isPending ||
                        mutSigninWithEmail.isSuccess
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
                        mutSigninWithEmail.isPending ||
                        mutSigninWithEmail.isSuccess
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
              form="sign-in-form"
              type="submit"
              variant="contained"
              disabled={
                mutSigninWithEmail.isPending || mutSigninWithEmail.isSuccess
              }
              fullWidth
            >
              {mutSigninWithEmail.isPending && (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Spinner size={24} /> <span>Signing in</span>
                </Stack>
              )}
              {!mutSigninWithEmail.isPending &&
                !mutSigninWithEmail.isSuccess &&
                'Sign in'}
              {mutSigninWithEmail.isSuccess && 'Signed in'}
            </Button>
            <Typography
              sx={{
                color: 'text.secondary',
                textAlign: 'center',
              }}
            >
              Don't have an account? <Link to="/signup">Sign up</Link>
            </Typography>
          </Stack>
        </CardActions>
      </Card>
    </AuthPageContainer>
  );
}
