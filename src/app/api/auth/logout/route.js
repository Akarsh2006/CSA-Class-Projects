export async function POST() {
  try {
    const response = Response.json({ message: 'Logged out successfully' });

    response.headers.set(
      'Set-Cookie',
      'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
    );

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
