import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("FundDistributor", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();
    const tempBalance = 1000;
    const FundDistributor = await ethers.getContractFactory("FundDistributor");
    const distributor = await FundDistributor.deploy({ value: tempBalance });

    return { distributor, owner, otherAccount, tempBalance };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { distributor, owner } = await loadFixture(deployFixture);

      expect(await distributor.owner()).to.equal(owner.address);
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called from another account", async function () {
        const { distributor, otherAccount } = await loadFixture(deployFixture);

        // We use lock.connect() to send a transaction from another account
        await expect(
          distributor.connect(otherAccount).withdraw()
        ).to.be.revertedWith("You aren't the owner");
      });

      it("Shouldn't fail if the owner calls it", async function () {
        const { distributor } = await loadFixture(deployFixture);

        await expect(distributor.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { distributor } = await loadFixture(deployFixture);

        await expect(distributor.withdraw())
          .to.emit(distributor, "Withdrawal")
          .withArgs(anyValue, anyValue);
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { distributor, owner, tempBalance } = await loadFixture(
          deployFixture
        );

        await expect(distributor.withdraw()).to.changeEtherBalances(
          [owner, distributor],
          [tempBalance, -tempBalance]
        );
      });
    });
  });

  describe("Distribute", () => {
    describe("Validations", () => {
      it("should revert if no receivers are sent", async () => {
        const { distributor } = await loadFixture(deployFixture);
        await expect(
          distributor.distribute([], ethers.utils.parseEther("1.0"))
        ).to.be.revertedWith("No receivers");
      });

      it("should revert if amount send is not enough", async () => {
        const { distributor, otherAccount } = await loadFixture(deployFixture);
        await expect(
          distributor.distribute(
            [otherAccount.getAddress()],
            ethers.utils.parseEther("1.0"),
            {
              value: ethers.utils.parseEther("0.9"),
            }
          )
        ).to.be.revertedWith("Insufficient amount");
      });

      it("should revert if amount sent is zero", async () => {
        const { distributor, otherAccount } = await loadFixture(deployFixture);
        await expect(
          distributor.distribute(
            [otherAccount.getAddress()],
            ethers.utils.parseEther("0")
          )
        ).to.be.revertedWith("Invalid amount per receiver");
      });

      it("should proceed if receivers are present and amount sent is enough", async () => {
        const { distributor, otherAccount } = await loadFixture(deployFixture);
        await expect(
          distributor.distribute(
            [otherAccount.getAddress()],
            ethers.utils.parseEther("1.0"),
            {
              value: ethers.utils.parseEther("1"),
            }
          )
        ).not.to.be.reverted;
      });
    });

    describe("Events", () => {
      it("should emit event", async () => {
        const { distributor, owner, otherAccount } = await loadFixture(
          deployFixture
        );
        const amount = ethers.utils.parseEther("1.0");
        const [ownerAddress, otherAccountAddress] = await Promise.all([
          owner.getAddress(),
          otherAccount.getAddress(),
        ]);
        await expect(
          distributor.distribute([otherAccountAddress], amount, {
            value: amount,
          })
        )
          .to.emit(distributor, "Distribute")
          .withArgs(ownerAddress, amount, [otherAccountAddress]);
      });
    });

    describe("Transfers", () => {
      it("should update other account balance", async () => {
        const { distributor, otherAccount } = await loadFixture(deployFixture);
        await expect(
          distributor.distribute(
            [otherAccount.getAddress()],
            ethers.utils.parseEther("1.0"),
            {
              value: ethers.utils.parseEther("1"),
            }
          )
        ).to.changeEtherBalances(
          [otherAccount],
          [ethers.utils.parseEther("1.0")]
        );
      });
    });
  });
});
