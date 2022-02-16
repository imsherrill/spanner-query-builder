import { SpannerQuery } from '../src';

describe('index', () => {
  describe('SpannerQuery', () => {
    it('should generate some valid sql', () => {
      const query = new SpannerQuery()
        .select('*', 'Contacts')
        .forceIndex('contactOfUserIdForContactsIdx')
        .where({ phoneNumber: '+19735240600', name: 'Isaac Sherrill' })
        .order(['id', 'phoneNumber'], 'DESC');

      const queryString = query.toSql();

      console.log(queryString);

      const expectedSql = `SELECT * FROM Contacts
@{FORCE_INDEX="contactOfUserIdForContactsIdx"}
WHERE phoneNumber = '+19735240600'
AND name = 'Isaac Sherrill'
ORDER BY id, phoneNumber DESC;`;

      expect(queryString).toEqual(expectedSql);
    });

    it('should be able to join', () => {
      const query = new SpannerQuery()
        .select('*', 'Contacts')
        .join('Users', 'Users.userId = Contacts.contactOfUserId')
        .where({ name: 'Isaac Sherrill' })
        .limit(3);

      const queryString = query.toSql();

      console.log(queryString);

      const expectedSql = `SELECT * FROM Contacts
JOIN Users ON Users.userId = Contacts.contactOfUserId
WHERE name = 'Isaac Sherrill'
LIMIT 3;`;

      expect(queryString).toEqual(expectedSql);
    });

    it('should support not', () => {
      const query = new SpannerQuery()
        .select('*', 'Contacts')
        .not()
        .where({ name: 'Isaac Sherrill', phoneNumber: '123456' });

      const queryString = query.toSql();

      console.log(queryString);

      const expectedSql = `SELECT * FROM Contacts
WHERE name != 'Isaac Sherrill'
AND phoneNumber != '123456';`;

      expect(queryString).toEqual(expectedSql);
    });
  });
});
