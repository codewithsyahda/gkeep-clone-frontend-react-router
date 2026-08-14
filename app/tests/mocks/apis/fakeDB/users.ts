export type TUserEntity = {
  id: string;
  name: string;
  email: string;
  password: string;
  emailVerified: boolean;
  image: null;
  createdAt: Date;
  updatedAt: Date;
};

export const users: TUserEntity[] = [
  {
    id: 'id-user-1',
    name: 'Foo Doe',
    email: 'foo@doe.com',
    password: '12121212',
    emailVerified: false,
    image: null,
    createdAt: new Date(2026, 0, 1),
    updatedAt: new Date(2026, 0, 1),
  },
  {
    id: 'id-user-2',
    name: 'Vin Doe',
    email: 'vin@doe.com',
    password: '23232323',
    emailVerified: false,
    image: null,
    createdAt: new Date(2026, 0, 2),
    updatedAt: new Date(2026, 0, 2),
  },
];

export class UsersDB {
  protected static _dbName = 'usersDB';

  static init() {
    window.sessionStorage.setItem(this._dbName, JSON.stringify(users));
  }

  static getAll() {
    return JSON.parse(
      window.sessionStorage.getItem(this._dbName) ?? '[]',
    ) as TUserEntity[];
  }

  static update(updatedUsers: TUserEntity[]) {
    window.sessionStorage.setItem(this._dbName, JSON.stringify(updatedUsers));
  }
}
