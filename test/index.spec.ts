import { SpannerQuery } from '../src';

describe('index', () => {
  describe('SpannerQuery', () => {
    it('should generate some valid sql (as of now this is just for running code)', () => {
      const query = new SpannerQuery()
        .select('*', 'Contacts')
        .forceIndex('contactOfUserIdForContactsIdx')
        .where({ phoneNumber: '+19735240600', name: 'Isaac Sherrill' })
        .order(['id', 'phoneNumber'], 'DESC');

      console.log(query.toSql());
    });

    it('should be able to join', () => {
      const query = new SpannerQuery()
        .select('*', 'Contacts')
        .join('Users', 'Users.userId = Contacts.contactOfUserId')
        .where({ name: 'Isaac Sherrill' })
        .limit(3);

      console.log(query.toSql());
    });

    it('should support not', () => {
      const query = new SpannerQuery()
        .select('*', 'Contacts')
        .not()
        .where({ name: 'Isaac Sherrill' });

      console.log(query.toSql());
    });
  });
});
